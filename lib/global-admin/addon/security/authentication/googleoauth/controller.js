import { get, set, computed, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import AuthMixin from 'global-admin/mixins/authentication';
import { isEmpty } from '@ember/utils';

export default Controller.extend(AuthMixin, {
  oauth:           service(),
  endpoint:        service(),
  access:          service(),
  settings:        service(),

  confirmDisable:  false,
  errors:          null,
  testing:         false,
  error:           null,
  saved:           false,
  saving:          false,
  haveToken:       false,

  organizations:   null,
  secure:          true,
  editing:         false,

  authConfig: alias('model.googleConfig'),

  actions: {
    save() {
      this.send('clearError');
      set(this, 'saving', true);

      const authConfig = get(this, 'authConfig');
      const am         = get(authConfig, 'accessMode') || 'unrestricted';

      setProperties(authConfig, {
        'oauthCredential':            (get(authConfig, 'oauthCredential') || '').trim(),
        'serviceAccountCredential':   (get(authConfig, 'serviceAccountCredential') || '').trim(),
        'adminEmail':                 (get(authConfig, 'adminEmail') || '').trim(),
        'hostname':                   (get(authConfig, 'hostname') || '').trim(),
        'enabled':                    false,
        'accessMode':                 am,
        'tls':                        true,
        'allowedPrincipalIds':        get(authConfig, 'allowedPrincipalIds') || [],
      });

      set(this, '_boundSucceed', this.authenticationApplied.bind(this));
      get(this, 'oauth').test(authConfig, get(this, '_boundSucceed'));
    },
  },

  destinationUrl: computed(() => {
    return `${ window.location.origin }/`;
  }),

  destinationDomain: computed(() => {
    return `${ window.location.hostname }`;
  }),

  redirectURI: computed(() => {
    return `${ window.location.origin }/verify-auth`;
  }),

  authorizedJavascriptOrigin: computed(() => {
    return `${ window.location.origin }`;
  }),

  buttonDisabled: computed('authConfig.hostname', 'authConfig.adminEmail', 'authConfig.serviceAccountCredential', 'authConfig.oauthCredential', function() {
    const authConfig          = get(this, 'authConfig');
    const isHostnameEmpty     = isEmpty(authConfig.get('hostname'))
    const isAdminEmailEmpty   = isEmpty(authConfig.get('adminEmail'))

    if (!get(this, 'authConfig.oauthCredential') || !get(this, 'authConfig.serviceAccountCredential') || isHostnameEmpty || isAdminEmailEmpty) {
      return true
    }

    return false
  }),

  authenticationApplied(err) {
    set(this, 'saving', false);

    if (err) {
      if (!get(this, 'model.originalConfig.enabled')) {
        set(this, 'isEnabled', false);
      } else {
        set(this, 'isEnabled', true)
      }
      this.send('gotError', err);

      return;
    }

    this.send('clearError');
  },
});
