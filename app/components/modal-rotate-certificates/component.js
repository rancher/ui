import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { alias } from '@ember/object/computed';

export default Component.extend(ModalBase, {
  growl:            service(),

  layout,
  classNames:       ['large-modal'],
  rotateCaCerts:    false,
  services:         null,
  selectedServices: null,
  mode:             'single',
  model:            alias('modalService.modalOpts.model'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      services: [],
      errors:   [],
    })
  },

  didReceiveAttrs() {
    if (this.model.certsExpiring) {
      const { expiringCerts } = this.model;
      let etcdNodes           = (expiringCerts || []).filter((cert) => cert.expiringCertName.includes('etcd'));

      set(this, 'services', this.modalOpts.serviceDefaults.map((cert) => {
        let expiringCert = null;
        let expiresIn = null;
        // this.modalOpts.serviceDefaults;

        if (cert === 'kubelet') {
          expiringCert = expiringCerts.findBy('expiringCertName', 'kube-node');
          expiresIn    = expiringCert.daysUntil;
        } else if (cert === 'etcd'){
          // there can be multiple etcd nodes with different cert expires, we can grab and alert the soonest expiring cert date since 'rofateCertificates' action will rotates all etcd node certs at the same time.
          expiringCert = etcdNodes.sortBy('daysUntil').get('firstObject');
          expiresIn    = expiringCert.daysUntil;
        } else {
          expiringCert = expiringCerts.findBy('expiringCertName', cert);
          expiresIn    = expiringCert.daysUntil;
        }

        return {
          label: expiringCert ? `${ cert } (expires in ${ expiresIn } days)` : `${ cert }`,
          value: cert,
        }
      }));
    } else {
      set(this, 'services', this.modalOpts.serviceDefaults.map((serv) => ( {
        label: serv,
        value: serv
      } )));
    }
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
