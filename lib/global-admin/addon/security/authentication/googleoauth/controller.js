import { get, set, computed, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import AuthMixin from 'global-admin/mixins/authentication';

export default Controller.extend(AuthMixin, {
  google:          service(),
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

  authConfig: alias('model.googleConfig'),
  isEnabled:  alias('authConfig.enabled'),

  actions: {
    save() {
      this.send('clearError');
      set(this, 'saving', true);

      const authConfig = get(this, 'authConfig');
      const am = 'unrestricted';

      setProperties(authConfig, {
        'oauthCredential':            (authConfig.get('oauthCredential') || '').trim(),
        'serviceAccountCredential':   (authConfig.get('serviceAccountCredential') || '').trim(),
        'adminEmail':                 (authConfig.get('adminEmail') || '').trim(),
        'hostname':                   (authConfig.get('hostname') || '').trim(),
        'enabled':                    false,
        'accessMode':                 am,
        'tls':                        true,
        'allowedPrincipalIds':        [],
      });

      set(this, '_boundSucceed', this.authenticationApplied.bind(this));
      get(this, 'google').test(authConfig, get(this, '_boundSucceed'));
    },
  },

  destinationUrl: computed(() => {
    return `${ window.location.origin }/`;
  }),

  destinationDomain: computed(() => {
    return `${ window.location.hostname }`
  }),

  redirectURI: computed(() => {
    return `${ window.location.origin }/verify-auth`
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
