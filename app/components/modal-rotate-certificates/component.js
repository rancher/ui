import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { alias } from '@ember/object/computed';
import moment from 'moment';
import { isEmpty } from '@ember/utils';

export default Component.extend(ModalBase, {
  growl: service(),
  intl:  service(),

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
      let certLabel           = null;


      set(this, 'services', this.modalOpts.serviceDefaults.map((cert) => {
        let expiringCert = null;
        let expiresIn    = null;

        if (cert === 'kubelet') {
          expiringCert = expiringCerts.findBy('expiringCertName', 'kube-node');
        } else if (cert === 'etcd' && etcdNodes.length > 0){
          // there can be multiple etcd nodes with different cert expires, we can grab and alert the soonest expiring cert date since 'rofateCertificates' action will rotates all etcd node certs at the same time.
          expiringCert = etcdNodes.sortBy('milliUntil').get('firstObject');
        } else {
          expiringCert = expiringCerts.findBy('expiringCertName', cert);
        }

        if (expiringCert && !isEmpty(expiringCert.exactDateTime)) {
          expiresIn    = expiringCert.exactDateTime;

          if (expiringCert.milliUntil > 0) {
            certLabel = this.intl.t('modalRotateCertificates.expiring.until', {
              cert,
              expiresIn: moment(expiresIn).fromNow(),
            });
          } else {
            certLabel = this.intl.t('modalRotateCertificates.expiring.from', {
              cert,
              expiresIn: moment(expiresIn).fromNow(),
            });
          }
        } else {
          certLabel = `${ cert }`
        }

        return {
          label: certLabel,
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
