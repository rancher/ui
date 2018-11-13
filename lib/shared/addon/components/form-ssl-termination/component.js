import {
  get, set, observer, computed, setProperties
} from '@ember/object';
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
  certs:                  null,
  errors:                 null,
  statusClass:            null,
  status:                 null,

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
    const errors = [];
    const intl = get(this, 'intl');
    const certs = get(this, 'certs').map((cert) => {
      const id = get(cert, 'certificateId');

      if ( !id && get(cert, 'mode') === 'custom' ) {
        errors.push(intl.t('formSslTermination.custom.required'));
      }

      if ( !id && get(cert, 'mode') !== 'custom' && get(cert, 'hosts.length') === 0 ) {
        errors.push(intl.t('formSslTermination.default.noHosts'));
      }

      if ( this.isWildcardCert(id) && get(cert, 'hosts.length') === 0 ) {
        const c = get(this, 'allCertificates').findBy('id', id);

        errors.push(intl.t('formSslTermination.wildcardCert', { name: get(c, 'name') }));
      }

      return {
        certificateId: cert.certificateId || null,
        hosts:         cert.hosts,
      };
    });

    setProperties(this, {
      errors:        errors.uniq(),
      'ingress.tls': certs
    });
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

  isWildcardCert(certId) {
    const cert = get(this, 'allCertificates').findBy('id', certId);

    if ( cert ) {
      return (get(cert, 'cn') || '').startsWith('*');
    }

    return false;
  },

});
