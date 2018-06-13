import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import {
  get, set, setProperties, computed
} from '@ember/object';
import C from 'ui/utils/constants';


export default Controller.extend({
  access:         service(),
  settings:       service(),
  intl:           service(),
  azureAd:        service(),

  confirmDisable: false,
  testing:        false,
  editing:        false,
  errors:         null,
  error:          null,
  _boundSucceed: null,

  azureADConfig:  alias('model.azureADConfig'),
  isEnabled:      alias('azureADConfig.enabled'),

  numUsers: computed('azureADConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return ( get(this, 'azureADConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_AZURE_USER)).get('length');
  }),

  numGroups: computed('azureADConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return ( get(this, 'azureADConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_AZURE_GROUP)).get('length');
  }),

  replyUrl: computed(function() {
    return `${window.location.origin}/`;
  }),

  authenticationApplied: function(err) {

    set(this, 'saving', false);

    if (err) {
      set(this, 'isEnabled', false);
      this.send('gotError', err);
      return;
    }

    this.send('clearError');
  },

  actions: {

    edit() {
      set(this, 'editing', true);
    },

    test: function() {
      this.send('clearError');

      const model = get(this, 'azureADConfig');
      const enabled = get(this, 'azureADConfig.enabled');

      setProperties(model, {
        accessMode: 'unrestricted',
        enabled: false,
        rancherUrl: `${window.location.origin}/verify-auth-azure`
      });

      var errors = model.validationErrors();

      if ( errors.get('length') ) {

        set(this, 'errors', errors);
        set(this, 'testing', false);
        model.set('enabled', enabled);

      } else {

        set(this, 'testing', true);

        get(this, 'azureAd').testConfig(model).then( (resp) => {
          const redirectUrl = get(resp, 'redirectUrl');

          if (redirectUrl) {

            set(this, '_boundSucceed', this.authenticationApplied.bind(this));

            get(this, 'azureAd').test(model, redirectUrl, get(this, '_boundSucceed'));
          }

        }).catch((err) => {

          set(model, 'enabled', enabled);

          this.send('gotError', err);

        });
      }
    },

    waitAndRefresh: function(url) {

      $('#loading-underlay, #loading-overlay').removeClass('hide').show();  // eslint-disable-line

      setTimeout(function() {
        window.location.href = url || window.location.href;
      }, 1000);

    },

    promptDisable: function() {

      set(this, 'confirmDisable', true);

      later(this, function() {
        set(this, 'confirmDisable', false);
      }, 10000);

    },

    gotError: function(err) {

      if ( err.message ) {

        this.send('showError', err.message + (err.detail? '('+err.detail+')' : ''));

      } else {

        this.send('showError', 'Error ('+err.status + ' - ' + err.code+')');

      }

      setProperties(this, {
        testing: false,
        saving: false,
      });

    },

    showError: function(msg) {

      set(this, 'errors', [msg]);

      window.scrollY = 0;

    },

    clearError: function() {

      set(this, 'errors', null);

    },

    disable: function() {

      this.send('clearError');

      const model = get(this, 'azureADConfig');

      setProperties(model, {
        enabled:  false,
      });

      model.doAction('disable').then(() => {

        this.send('waitAndRefresh');

      }).catch((err) => {

        this.send('gotError', err);

      }).finally(() => {

        set(this, 'confirmDisable', false);

      });
    },
  },
});
