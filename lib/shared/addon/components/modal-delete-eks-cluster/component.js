import Component from '@ember/component';
import layout from './template';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { Promise } from 'rsvp';

export default Component.extend(ModalBase, NewOrEdit, {
  modalService: service('modal'),
  intl:         service(),


  classNames: ['medium-modal'],
  clone:      null,
  errors:     null,
  updateKeys: true,

  layout,

  originalModel:   alias('modalService.modalOpts.model'),
  primaryResource: alias('originalModel'),

  actions: {
    confirmKeys(cb) {
      if (this.validate()) {
        this.canListEksClusters().then( () => {
          get(this, 'primaryResource').save().then(() => {
            get(this, 'primaryResource').delete().then(() => {
              cb();
              this.send('cancel');
            }).catch( (e) => {
              cb(false, e);
            });
          }).catch( (e) => {
            cb(false, e);
          });
        }).catch( (e) => {
          cb(false, e);
        });
      } else {
        cb(false);
      }
    }
  },

  canListEksClusters() {
    return new Promise((resolve, reject) => {
      const eks      = new AWS.EKS(this.authCreds());

      eks.listClusters({}, (err, clusters) => {
        if ( err ) {
          return reject(err);
        }

        return resolve({ clusters: clusters.clusters });
      });
    });
  },

  validate() {
    const config = get(this, 'primaryResource.amazonElasticContainerServiceConfig');
    const errors = get(this, 'errors') || [];

    let {
      accessKey, secretKey, sessionToken
    } = config;

    if (!accessKey) {
      errors.push(get(this, 'intl').t('deleteEksCluster.error.accessKey'));
    }

    if (!secretKey) {
      errors.push(get(this, 'intl').t('deleteEksCluster.error.secretKey'));
    }
    if (!sessionToken) {
      errors.push(get(this, 'intl').t('deleteEksCluster.error.sessionToken'));
    }

    set(this, 'errors', errors);

    return errors.length > 0;
  },

  authCreds() {
    const config = get(this, 'primaryResource.amazonElasticContainerServiceConfig');

    let {
      accessKey, secretKey, region, sessionToken
    } = config;

    accessKey    = accessKey.trim();
    secretKey    = secretKey.trim();

    setProperties(config, {
      accessKey,
      secretKey,
    });

    const auth    = {
      region,
      accessKeyId:     accessKey,
      secretAccessKey: secretKey,
    };

    if (sessionToken) {
      set(auth, 'sessionToken', sessionToken);
    }

    return auth;
  },

});
