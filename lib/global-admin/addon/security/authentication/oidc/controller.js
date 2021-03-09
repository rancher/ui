import Controller from '@ember/controller';
import { computed, get, set, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import AuthMixin from 'global-admin/mixins/authentication';

export default Controller.extend(AuthMixin, {
  oauth:    service(),
  access:   service(),
  settings: service(),

  confirmDisable: false,
  errors:         null,
  testing:        false,
  error:          null,
  saved:          false,
  saving:         false,

  authConfig: alias('model.oidcConfig'),
  isEnabled:  alias('authConfig.enabled'),

  actions: {
    save() {
      this.send('clearError');
      set(this, 'saving', true);

      const authConfig = get(this, 'authConfig');
      const am           = get(authConfig, 'accessMode') || 'restricted';

      setProperties(authConfig, {
        'accessMode':          am,
        'allowedPrincipalIds': get(authConfig, 'allowedPrincipalIds') || [],
        'authEndpoint':        `http://${(get(authConfig, 'authEndpoint') || '').trim()}`,
        'clientId':            (get(authConfig, 'clientId') || '').trim(),
        'clientSecret':        (get(authConfig, 'clientSecret') || '').trim(),
        'enabled':             false,
        'grantType':           (get(authConfig, 'grantType') || 'authorization_code').trim(),
        'issuer':              `http://${ (get(authConfig, 'issuer') || '').trim() }`,
        'rancherUrl':          (get(authConfig, 'rancherUrl') || `${ window.location.origin }/verify-auth`).trim(),
        'responseType':        (get(authConfig, 'responseType') || 'code').trim(),
        'scope':               (get(authConfig, 'scope') || 'openid').trim(),
        'tokenEndpoint':       (get(authConfig, 'tokenEndpoint') || '').trim(),
        'userInfoEndpoint':    (get(authConfig, 'userInfoEndpoint') || '').trim(),
      });

      set(this, '_boundSucceed', this.authenticationApplied.bind(this));
      get(this, 'oauth').test(authConfig, get(this, '_boundSucceed'));
    },
  },

  createDisabled: computed('authConfig.{clientId,clientSecret,authEndpoint,issuer}', 'testing', function() {
    const {
      authConfig: {
        clientId, clientSecret, authEndpoint, issuer
      }
    } = this;
    const requiredVals = [clientId, clientSecret, authEndpoint, issuer];

    if (requiredVals.any((val) => isEmpty(val))) {
      return true;
    }

    if ( get(this, 'testing') ) {
      return true;
    }

    return false;
  }),

  authenticationApplied(err) {
    set(this, 'saving', false);

    if (err) {
      set(this, 'isEnabled', false);
      this.send('gotError', err);

      return;
    }

    this.send('clearError');
  },
});
