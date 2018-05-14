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

  confirmDisable: false,
  errors:         null,
  testing:        false,
  error:          null,

  loginUsername:  null,
  loginPassword:  null,

  //new
  azureADConfig:  alias('model.azureADConfig'),
  isEnabled:      alias('azureADConfig.enabled'),
  // isEnabled:      true,
  mode:           'global',
  modeClass:      'span-4',

  numUsers: computed('azureADConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return ( get(this, 'azureADConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_AZURE_USER)).get('length');
  }),

  numGroups: computed('azureADConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return ( get(this, 'azureADConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_AZURE_GROUP)).get('length');
  }),

  actions: {
    toggleMode() {

      if (get(this, 'mode') === 'global') {

        setProperties(this, {
          mode:      'china',
          modeClass: 'span-3'
        });

      } else {

        setProperties(this, {
          mode:      'global',
          modeClass: 'span-4'
        });

      }
    },

    test: function() {
      this.send('clearError');

      const model = get(this, 'azureADConfig');

      model.setProperties({
        accessMode: 'unrestricted',
      });

      var errors = model.validationErrors();

      if ( errors.get('length') ) {

        set(this, 'errors', errors);
        set(this, 'testing', false);
        model.set('enabled', false);

      } else {

        set(this, 'testing', true);

        delete model.enabled;

        model.doAction('testAndApply', {
          azureAdConfig: model,
          enabled:       true,
          username:      get(this, 'loginUsername'),
          password:      get(this, 'loginPassword'),
        }).then( () => {

          this.send('waitAndRefresh');

        }).catch((err) => {

          set(model, 'enabled', false);

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
        username: null,
        password: null,
      });

      model.save().then(() => {

      // model.doAction('disable').then(() => {

        this.send('waitAndRefresh');

      }).catch((err) => {

        this.send('gotError', err);

      }).finally(() => {

        set(this, 'confirmDisable', false);

      });
    },
  },
});
