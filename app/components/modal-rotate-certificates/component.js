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
  mode:             'single',

  init() {
    this._super(...arguments);

    setProperties(this, {
      services: [],
      errors:   [],
    })
  },

  didReceiveAttrs() {
    set(this, 'services', this.modalOpts.serviceDefaults);
  },

  actions: {
    rotateCaCerts(cb){
      const resource = this.modalOpts.model;
      const params   = this.getRotateCertsParams();

      resource.doAction('rotateCertificates', params).then(() => {
        this.send('cancel');
      })
        .catch((err) => {
          this.growl.fromError(err);
          if (cb) {
            cb(false);
          }
        });
    },

    mutServices(select) {
      set(this, 'selectedServices', select);
    }
  },

  getRotateCertsParams() {
    switch (this.mode) {
    case 'caAndService':
      return {
        services:       '',
        caCertificates: true,
      };
    case 'single':
      return {
        services:       get(this, 'selectedServices'),
        caCertificates: false,
      };
    case 'service':
      return {
        services:       null,
        caCertificates: false,
      };
    default:
      return;
    }
  },
});
