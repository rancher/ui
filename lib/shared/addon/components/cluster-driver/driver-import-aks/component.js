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
import { addQueryParams } from 'shared/utils/util';
import layout from './template';

export default Component.extend(ClusterDriver, {
  globalStore: service(),
  growl:       service(),
  settings:    service(),
  intl:        service(),

  layout,
  configField:     'aksConfig',
  step:            1,
  loading:         false,
  nodeForInfo:     null,
  loadingClusters: false,
  errors:          null,
  otherErrors:     null,
  clusterErrors:   null,
  selectedCred:    null,
  isPostSave:      false,
  regions:         null,

  isEdit:       equal('mode', 'edit'),
  isNew:        equal('mode', 'new'),
  clusterState: alias('model.originalCluster.state'),

  allErrors: union('errors', 'otherErrors', 'clusterErrors'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      errors:        [],
      clusterErrors: [],
      otherErrors:   [],
    });

    if (this.isEdit) {
      const aksConfig = get(this, 'model.cluster.aksConfig');
      const cloudCredId = get(aksConfig, 'azureCredentialSecret');
      const tenantId = get(aksConfig, 'tenantId');
      const cloudCred = (this.model.cloudCredentials || []).find((cc) => cc.id === cloudCredId);

      if (!isEmpty(cloudCred) && !isEmpty(tenantId)) {
        next(() => {
          this.send('finishAndSelectCloudCredential', cloudCred);
        });
      }
    } else {
      this.bootstrapAksV2Cluster();
    }
  },

  actions: {
    clusterSet(cluster) {
      if (!isEmpty(cluster?.resourceGroup)) {
        set(this, 'config.resourceGroup', cluster.resourceGroup);
      }
    },
    finishAndSelectCloudCredential(cred) {
      if (isEmpty(cred)) {
        set(this, 'config.azureCredentialSecret', null);
        set(this, 'selectedCred', null);
      } else {
        set(this, 'config.azureCredentialSecret', cred.id);
        set(this, 'selectedCred', cred);

        this.send('fetchAksResources', (ok, err) => {
          if (!ok) {
            this.send('errorHandler', err);
          }
        });
      }
    },

    async fetchAksResources(cb) {
      const {
        azureCredentialSecret, tenantId, resourceLocation
      } = this.config;
      const data = {
        cloudCredentialId: azureCredentialSecret,
        tenantId,
        region:            resourceLocation,
      };
      const url = addQueryParams('/meta/aksClusters', data);
      const errors   = [];
      let step       = 2;
      let allClusters;

      set(this, 'loadingClusters', true);

      try {
        allClusters = await this.globalStore.rawRequest({
          url,
          method: 'GET',
        });

        allClusters = (allClusters?.body || []).map((c) => {
          return {
            label:         c?.clusterName,
            value:         c?.clusterName,
            resourceGroup: c?.resourceGroup
          };
        }),

        setProperties(this, {
          allClusters,
          step,
        });

        if (cb) {
          cb()
        }
      } catch (err) {
        errors.pushObject(`Failed to load Clusters from Azure: ${ err.message }`);

        // Azure List Clusters API fails sometimes to list this, user cnn input a cluster name though so dont fail
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

  regionOrCredentialChanged: on('init', observer('config.{resourceLocation,azureCredentialSecret}', function() {
    const {
      config: {
        resourceLocation,
        azureCredentialSecret,
        tenantId,
      },
      loadingClusters,
      errors
    } = this;

    if (errors && errors.length >= 1) {
      setProperties(this, {
        loadFailedAllClusters: false,
        errors:                [],
      });
    }

    if (!isEmpty(resourceLocation) && !isEmpty(azureCredentialSecret) && !isEmpty(tenantId) && !loadingClusters) {
      this.send('fetchAksResources');
    }
  })),

  cloudCredentials: computed('model.cloudCredentials.[]', function() {
    const { model: { cloudCredentials } } = this;

    return cloudCredentials.filter((cc) => !isEmpty(get(cc, 'azurecredentialConfig')));
  }),


  disableImport: computed('step', 'config.{azureCredentialSecret,clusterName,resourceGroup}', function() {
    const {
      step, config: {
        azureCredentialSecret, clusterName, resourceGroup
      }
    } = this;

    if (step <= 2 && !isEmpty(azureCredentialSecret) && !isEmpty(clusterName) && !isEmpty(resourceGroup)) {
      return false;
    }

    return true;
  }),

  doneSaving() {
    const {
      isPostSave,
      model: {
        cluster: {
          aksConfig = {},
          aksStatus = {},
        }
      }
    } = this;
    const privateAccess = !get(aksStatus, 'aksConfig.privateCluster') || !get(aksConfig, 'privateCluster') || false;

    if (isPostSave && privateAccess) {
      set(this, 'step', 3);

      return;
    }

    if (this.close) {
      this.close();
    }
  },

  bootstrapAksV2Cluster() {
    const aksConfig = this.globalStore.createRecord({
      azureCredentialSecret: '',
      clusterName:           '',
      imported:              true,
      resourceGroup:         '',
      resourceLocation:      'eastus',
      tenantId:              '',
      type:                  'aksclusterconfigspec',
    });

    set(this, 'model.cluster.aksConfig', aksConfig);
    set(this, 'config', aksConfig);
  },
});
