import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed, get, set, setProperties } from '@ember/object';
import AuthMixin from 'global-admin/mixins/authentication';
import { alias } from '@ember/object/computed';
import C from 'ui/utils/constants';

export default Controller.extend(AuthMixin, {
  settings:       service(),
  saml:           service(),
  providerName:   'authPage.saml.providerName.ping',
  errors:         null,
  redirectUrl:    null,
  saving:         false,
  saved:          false,
  testing:        false,
  disableAuth:    true,
  urlError:       null,
  urlWarning:     false,
  urlInvalid:     false,
  protocol:         'https://',


  authConfig:     alias('model.authConfig'),

  actions: {
    authTest() {
      this.send('clearError');

      const model = get(this, 'authConfig');
      const am    = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, { accessMode: am });

      const errors = model.validationErrors();

      if ( errors.get('length') ) {
        setProperties(this, {
          errors,
          testing: false
        });

        set(model, 'enabled', false);
      } else {
        set(this, 'testing', true);

        setProperties(model, {
          'enabled':             false, // It should already be, but just in case..
          'allowedPrincipalIds': [],
        });

        model.save().then(() => {
          model.doAction('testAndEnable', { finalRedirectUrl: `${ window.location.origin }/verify-auth?config=ping` }).then( ( resp ) => {
            get(this, 'saml').test(resp, () => {
              this.send('waitAndRefresh')
            });
          }).catch((err) => {
            this.set('errors', [err]);
          });
        }).catch((err) => {
          this.set('errors', [err]);
        });
      }
    },
  },

  apiHost: computed('authConfig.rancherApiHost', {
    get() {
      let host = get(this, 'authConfig.rancherApiHost');

      return host.slice(8, host.length);
    },
    set(key, value) {
      let host = `${ get(this, 'protocol') }${ value }`;

      return set(this, 'authConfig.rancherApiHost', host);
    },
  }),

  numUsers: computed('authConfig.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    return (this.get('authConfig.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_PING_USER).get('length');
  }),

  numOrgs: computed('authConfig.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    return (this.get('authConfig.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_PING_GROUP).get('length');
  }),

});
