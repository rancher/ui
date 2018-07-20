import { get, set, observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  intl: service(),

  layout,
  editing:                null,
  ingress:                null,
  namespacedCertificates: null,
  namespace:              null,
  certificates:           null,

  certs: null,

  statusClass:     null,
  status:          null,
  init() {
    this._super(...arguments);
    const certs = get(this, 'ingress.tls') || [];

    set(this, 'certs', certs);
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  didInsertElement() {
    if (get(this, 'editing') && get(this, 'certs.length') === 0) {
      this.send('addCert');
    }
  },

  actions: {
    removeCert(cert) {
      get(this, 'certs').removeObject(cert);
    },

    addCert() {
      get(this, 'certs').pushObject({
        certificateId: '',
        hosts:         []
      });
    },
  },

  inputDidChange: observer('certs.@each.{certificateId,hosts}', function() {
    const certs = get(this, 'certs').filter((cert) => cert.certificateId).map((cert) => {
      return {
        certificateId: cert.certificateId,
        hosts:         cert.hosts,
      };
    });

    set(this, 'ingress.tls', certs)
  }),

  allCertificates: computed('namespacedCertificates.[]', 'certificates.[]', 'namespace', function() {
    const out = [];
    const namespacedCertificates = (get(this, 'namespacedCertificates') || []).filter((c) => {
      const selectedNamespace = get(this, 'namespace.id');

      return selectedNamespace === c.namespaceId;
    });

    out.pushObjects(namespacedCertificates.toArray());
    out.pushObjects((get(this, 'certificates') || []).toArray());

    return out;
  }),

});
