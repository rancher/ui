import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { alias, equal, union } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import ClusterDriver from 'shared/mixins/cluster-driver';
import { EKS_REGIONS } from 'shared/utils/amazon';
import { randomStr } from 'shared/utils/util';
import layout from './template';

export default Component.extend(ClusterDriver, {
  globalStore: service(),
  growl:       service(),
  settings:    service(),
  intl:        service(),

  layout,
  configField:     'eksConfig',
  step:            1,
  loading:         false,
  nodeForInfo:     null,
  loadingClusters: false,
  regionChoices:   EKS_REGIONS,
  errors:          null,
  otherErrors:     null,
  clusterErrors:   null,
  selectedCred:    null,

  isEdit:       equal('mode', 'edit'),
  clusterState: alias('model.originalCluster.state'),

  allErrors:    union('errors', 'otherErrors', 'clusterErrors'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      errors:        [],
      clusterErrors: [],
      otherErrors:   [],
    });

    if (this.isEdit) {
      const cloudCredId = get(this, 'model.cluster.eksConfig.amazonCredentialSecret');
      const cloudCred = (this.model.cloudCredentials || []).find((cc) => cc.id === cloudCredId);

      if (!isEmpty(cloudCred)) {
        next(() => {
          this.send('finishAndSelectCloudCredential', cloudCred);
        });
      }
    } else {
      this.bootstrapEksV2Cluster();
    }
  },

  actions: {
    finishAndSelectCloudCredential(cred) {
      if (isEmpty(cred)) {
        set(this, 'config.amazonCredentialSecret', null);
        set(this, 'selectedCred', null);
      } else {
        set(this, 'config.amazonCredentialSecret', cred.id);
        set(this, 'selectedCred', cred);

        this.send('fetchEksResources');
      }
    },

    async fetchEksResources(cb) {
      const errors   = [];
      let step       = 2;
      let allClusters;

      set(this, 'loadingClusters', true);

      try {
        const authCreds = this.authCreds();

        allClusters = await this.listEksClusters(authCreds);

        setProperties(this, {
          allClusters: (allClusters || []).map((c) => {
            return {
              label: c,
              value: c
            };
          }),
          step,
        });

        if (cb) {
          cb()
        }
      } catch (err) {
        errors.pushObject(`Failed to load Clusters from Amazon: ${ err.message }`);

        // EKS List Clusters API fails sometimes to list this, user cnn input a cluster name though so dont fail
        setProperties(this, {
          loadFailedAllClusters: true,
          errors
        });

        if (cb) {
          cb(false, err);
        }
      } finally {
        setProperties(this, {
          loadingClusters: false,
          step,
        });
      }
    },
  },

  regionOrCredentialChanged: on('init', observer('config.region', 'config.amazonCredentialSecret', function() {
    const {
      config: {
        region,
        amazonCredentialSecret,
      },
      loadingClusters
    } = this;

    if (!isEmpty(region) && !isEmpty(amazonCredentialSecret) && !loadingClusters) {
      this.send('fetchEksResources');
    }
  })),

  cloudCredentials: computed('model.cloudCredentials.[]', function() {
    const { model: { cloudCredentials } } = this;

    return cloudCredentials.filter((cc) => !isEmpty(get(cc, 'amazonec2credentialConfig')));
  }),


  disableImport: computed('step', 'config.{amazonCredentialSecret,displayName}', function() {
    const { step, config: { amazonCredentialSecret, displayName } } = this;

    if (step <= 2 && !isEmpty(amazonCredentialSecret) && !isEmpty(displayName)) {
      return false;
    }

    return true;
  }),

  doneSaving() {
    if (this.close) {
      this.close();
    }
  },

  bootstrapEksV2Cluster() {
    const eksConfig = this.globalStore.createRecord({
      displayName:       '',
      imported:          true,
      region:            'us-west-2',
      type:              'eksclusterconfigspec',
    });

    set(this, 'model.cluster.eksConfig', eksConfig);
    set(this, 'config', eksConfig);
  },

  listEksClusters(auth) {
    return new Promise((resolve, reject) => {
      const eks = new AWS.EKS(auth);

      eks.listClusters({}, (err, data) => {
        if (err) {
          console.log(err, err.stack);

          return reject(err);
        }

        return resolve(data.clusters);
      });
    })
  },

  authCreds() {
    let {
      config: {
        region,
        amazonCredentialSecret
      }
    } = this;

    const auth = {
      accessKeyId:         randomStr(),
      secretAccessKey:     randomStr(),
      region,
      httpOptions:         { cloudCredentialId: amazonCredentialSecret },
    };


    return auth;
  },
});
