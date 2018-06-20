import { later } from '@ember/runloop';
import { get, set, computed, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';

export default Controller.extend({
  access            : service(),
  settings          : service(),
  intl              : service(),

  confirmDisable    : false,
  errors            : null,
  testing           : false,
  error             : null,

  adminName         : '',
  adminPublicValue  : '',
  adminSecretValue  : '',
  adminSecretValue2 : '',

  createDisabled: computed('adminPublicValue','adminSecretValue','adminSecretValue2', function() {
    var ok = get(this, 'adminPublicValue.length') && get(this, 'adminSecretValue.length') && (get(this, 'adminSecretValue') === get(this, 'adminSecretValue2'));
    return !ok;
  }),

  validateDescription: computed(function() {
    return get(this, 'settings').get(C.SETTING.AUTH_LOCAL_VALIDATE_DESC) || null;
  }),

  actions: {
    test: function() {
      if ( !get(this, 'adminPublicValue') )
      {
        return void this.send('showError','Login username is required');
      }

      if ( !get(this, 'adminSecretValue') )
      {
        return void this.send('showError','Password is required');
      }

      if ( get(this, 'adminSecretValue') !== get(this, 'adminSecretValue2') )
      {
        return void this.send('showError','Passwords do not match');
      }

      this.send('clearError');
      set(this, 'testing', true);

      const model = get(this, 'model');
      const am    = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, {
        name: get(this, 'adminName'),
        accessMode: am,
        username: get(this, 'adminPublicValue'),
        password: get(this, 'adminSecretValue'),
        enabled: false,
      });

      model.save().then(() => {
        // Wait a bit for the new config to take effect...
        setTimeout(() => {
          this.send('authenticate');
        }, 1000);
      }).catch(err => {
        this.send('gotError', err);
      });
    },

    authenticate: function() {
      this.send('clearError');
      var code = get(this, 'adminPublicValue')+':'+get(this, 'adminSecretValue');
      get(this, 'access').login(code).then(res => {
        this.send('authenticationSucceeded', res.body);
      }).catch(err => {
        this.send('gotError', err);
      });
    },

    authenticationSucceeded: function(/*auth*/) {
      this.send('clearError');

      // Set this to true so the token will be sent with the request
      set(this, 'access.enabled', true);

      const model = get(this, 'model');

      setProperties(model, {
        enabled: true,
      });

      model.save().then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        set(this, 'access.enabled', false);
        this.send('gotError', err);
      });
    },

    waitAndRefresh: function(url) {
      $('#loading-underlay, #loading-overlay').removeClass('hide').show(); // eslint-disable-line
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
      if ( err.message )
      {
        this.send('showError', err.message + (err.detail? '('+err.detail+')' : ''));
      }
      else
      {
        this.send('showError', 'Error ('+err.status + ' - ' + err.code+')');
      }

      set(this, 'testing', false);
      set(this, 'saving', false);
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

      var model = get(this, 'model');
      setProperties(model, {
        enabled: false,
        username: "",
        password: "",
      });

      model.save().then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        set(this, 'confirmDisable', false);
      });
    },
  },
});
