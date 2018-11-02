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


  classNames: ['medium-modal'],
  clone:      null,
  errors:     null,
  updateKeys: true,

  layout,

  originalModel:   alias('modalService.modalOpts.model'),
  primaryResource: alias('originalModel'),

  actions: {
    confirmKeys(cb) {
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
