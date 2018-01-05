import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  intl: service(),

  editing: null,
  ingress: null,
  allCertificates: null,

  certs: null,

  init() {
    this._super(...arguments);
    const certs = get(this, 'ingress.tls') || [];
    set(this, 'certs', certs);
  },

  actions: {
    removeCert(cert) {
      get(this, 'certs').removeObject(cert);
    },

    addCert() {
      get(this, 'certs').pushObject({
        certificateId: '',
        hosts: []
      });
    },
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  didInsertElement: function () {
    if (get(this, 'editing') && get(this, 'certs.length') === 0) {
      this.send('addCert');
    }
  },

  readOnly: observer('editing', function () {
    return !get(this, 'editing');
  }),

  inputDidChange: observer('certs.@each.{certificateId,hosts}', function () {
    const certs = get(this, 'certs').filter(cert => cert.certificateId).map(cert => {
      return {
        certificateId: cert.certificateId,
        hosts: cert.hosts,
      };
    });
    set(this, 'ingress.tls', certs)
  }),

  statusClass: null,
  status: null,
});
