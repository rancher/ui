import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { get, set, setProperties, computed } from '@ember/object';
import C from 'ui/utils/constants';
import AuthMixin from 'global-admin/mixins/authentication';


export default Controller.extend(AuthMixin, {
  access:         service(),
  settings:       service(),
  intl:           service(),
  azureAd:        service(),

  confirmDisable: false,
  testing:        false,
  editing:        false,
  errors:         null,
  error:          null,
  region:         null,
  _boundSucceed:  null,

  authConfig:     alias('model.azureADConfig'),

  actions: {

    test() {
      this.send('clearError');

      const model   = get(this, 'authConfig');
      const am      = get(this, 'authConfig.accessMode') || 'unrestricted';

      setProperties(model, {
        accessMode: am,
        rancherUrl: `${ window.location.origin }/verify-auth-azure`
      });

      var errors = model.validationErrors();

      if ( errors.get('length') ) {
        set(model, 'enabled', false);

        setProperties(this, {
          errors,
          testing: false,
        });
      } else {
        set(this, 'testing', true);

        get(this, 'azureAd').testConfig(model).then( (resp) => {
          const redirectUrl = get(resp, 'redirectUrl');

          if (redirectUrl) {
            set(this, '_boundSucceed', this.authenticationApplied.bind(this));

            get(this, 'azureAd').test(model, redirectUrl, get(this, '_boundSucceed'));
          }
        }).catch((err) => {
          set(model, 'enabled', false);

          this.send('gotError', err);
        });
      }
    },

  },
  numUsers: computed('authConfig.allowedPrincipalIds.[]', 'userType', 'groupType', function() {
    return ( get(this, 'authConfig.allowedPrincipalIds') || [] ).filter((principal) => principal.includes(C.PROJECT.TYPE_AZURE_USER)).get('length');
  }),

  numGroups: computed('authConfig.allowedPrincipalIds.[]', 'userType', 'groupType', function() {
    return ( get(this, 'authConfig.allowedPrincipalIds') || [] ).filter((principal) => principal.includes(C.PROJECT.TYPE_AZURE_GROUP)).get('length');
  }),

  replyUrl: computed(() => {
    return `${ window.location.origin }/verify-auth-azure`;
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
