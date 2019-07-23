import { alias } from '@ember/object/computed';
import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
const NONE = 'NONE';
const ISTIO_MUTUAL = 'ISTIO_MUTUAL';
const DISABLE = 'DISABLE';
const SIMPLE = 'SIMPLE';
const MUTUAL = 'MUTUAL';

export default Component.extend({
  intl: service(),

  layout,

  tlsMode:       NONE,
  trafficPolicy: null,
  errors:        null,

  model: alias('trafficPolicy.tls'),

  init() {
    this._super(...arguments);

    this.initTls();
  },

  actions: {
    setSubjectAltNames(subjectAltNames) {
      set(this, 'model.subjectAltNames', subjectAltNames);
    }
  },

  tlsModeDidChange: observer('tlsMode', function() {
    const tlsMode = get(this, 'tlsMode');
    const trafficPolicy = get(this, 'trafficPolicy');

    if ( tlsMode === NONE ) {
      delete trafficPolicy['tls'];
    } else if ( tlsMode === ISTIO_MUTUAL ) {
      set(this, 'model', { mode: ISTIO_MUTUAL });
    } else if ( tlsMode === DISABLE ) {
      set(this, 'model', { mode: DISABLE });
    } else if ( tlsMode === SIMPLE ) {
      const out = { mode: SIMPLE };

      if ( get(this, 'model.caCertificates') ) {
        set(out, 'caCertificates', get(this, 'model.caCertificates'))
      }
      if ( get(this, 'model.sni') ) {
        set(out, 'sni', get(this, 'model.sni'))
      }
      if ( get(this, 'model.subjectAltNames.length') > 0 ) {
        set(out, 'subjectAltNames', get(this, 'model.subjectAltNames'))
      }
      set(this, 'model', out);
    } else if ( tlsMode === MUTUAL ) {
      const out = { mode: MUTUAL };

      if ( get(this, 'model.clientCertificate') ) {
        set(out, 'clientCertificate', get(this, 'model.clientCertificate'))
      }
      if ( get(this, 'model.privateKey') ) {
        set(out, 'privateKey', get(this, 'model.privateKey'))
      }
      if ( get(this, 'model.caCertificates') ) {
        set(out, 'caCertificates', get(this, 'model.caCertificates'))
      }
      if ( get(this, 'model.sni') ) {
        set(out, 'sni', get(this, 'model.sni'))
      }
      if ( get(this, 'model.subjectAltNames.length') > 0 ) {
        set(out, 'subjectAltNames', get(this, 'model.subjectAltNames'))
      }
      set(this, 'model', out);
    }
  }),

  validate: observer('tlsMode', 'model.clientCertificate', 'model.privateKey', function() {
    const errors = [];

    if ( get(this, 'tlsMode') === MUTUAL ) {
      if ( !get(this, 'model.clientCertificate') ) {
        errors.push(get(this, 'intl').t('cruDestinationRule.tls.clientCertificate.error'));
      }

      if ( !get(this, 'model.privateKey') ) {
        errors.push(get(this, 'intl').t('cruDestinationRule.tls.privateKey.error'));
      }
    }
    set(this, 'errors', errors);
  }),

  initTls() {
    if ( !get(this, 'model') || !get(this, 'model.mode') ) {
      set(this, 'tlsMode', NONE);
    } else {
      set(this, 'tlsMode', get(this, 'model.mode'));
    }
  },

});
