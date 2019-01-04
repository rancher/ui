import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  growl:            service(),

  layout,
  classNames:       ['large-modal'],
  rotateCaCerts:    false,
  services:         null,
  selectedServices: null,

  init() {
    this._super(...arguments);

    setProperties(this, {
      services: [],
      errors:   [],
    })
  },

  didReceiveAttrs() {
    let { services } = this.modalOpts.model.rancherKubernetesEngineConfig;

    set(this, 'services', Object.keys((services || {})).sort());
  },

  actions: {
    rotateCaCerts(cb){
      const resource = this.modalOpts.model;
      const params   = {
        caCertificates: get(this, 'rotateCaCerts'),
        services:       get(this, 'selectedServices')
      }

      resource.doAction('rotateCertificates', params).then(() => {
        this.send('cancel');
      })
        .catch((err) => {
          this.growl.fromError(err);
          if (cb) {
            cb(false);
          }
        })
    },
    mutServices(select) {
      set(this, 'selectedServices', select);
    }
  },
});
