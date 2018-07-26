import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed, get, set, setProperties } from '@ember/object';
import AuthMixin from 'global-admin/mixins/authentication';
import { alias } from '@ember/object/computed';
import C from 'ui/utils/constants';

export default Controller.extend(AuthMixin, {
  settings:       service(),
  saml:           service(),
  providerName:   'authPage.saml.providerName.adfs',
  errors:         null,
  redirectUrl:    null,
  saving:         false,
  saved:          false,
  testing:        false,
  disableAuth:    true,
  urlError:       null,
  urlWarning:     false,
  urlInvalid:     false,


  authConfig:     alias('model.authConfig'),

  actions: {
    authTest() {
      this.send('clearError');

      const model = get(this, 'authConfig');
      const am    = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, { accessMode: am, });

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
          model.doAction('testAndEnable', { finalRedirectUrl: `${ window.location.origin }/verify-auth?config=adfs` }).then( ( resp ) => {
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

  numUsers: computed('authConfig.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    return (this.get('authConfig.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_ADFS_USER).get('length');
  }),

  numOrgs: computed('authConfig.allowedIdentities.@each.externalIdType', 'wasRestricted', function() {
    return (this.get('authConfig.allowedIdentities') || []).filterBy('externalIdType', C.PROJECT.TYPE_ADFS_GROUP).get('length');
  }),

});
