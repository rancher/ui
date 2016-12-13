import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  access            : Ember.inject.service(),
  settings          : Ember.inject.service(),
  intl              : Ember.inject.service(),

  confirmDisable    : false,
  errors            : null,
  testing           : false,
  error             : null,

  adminName         : '',
  adminPublicValue  : '',
  adminSecretValue  : '',
  adminSecretValue2 : '',

  createDisabled: function() {
    var ok = this.get('adminPublicValue.length') && this.get('adminSecretValue.length') && (this.get('adminSecretValue') === this.get('adminSecretValue2'));
    return !ok;
  }.property('adminPublicValue','adminSecretValue','adminSecretValue2'),

  validateDescription: Ember.computed(function() {
    return this.get('settings').get(C.SETTING.AUTH_LOCAL_VALIDATE_DESC) || null;
  }),

  actions: {
    test: function() {
      if ( !this.get('adminPublicValue') )
      {
        return void this.send('showError','Login username is required');
      }

      if ( !this.get('adminSecretValue') )
      {
        return void this.send('showError','Password is required');
      }

      if ( this.get('adminSecretValue') !== this.get('adminSecretValue2') )
      {
        return void this.send('showError','Passwords do not match');
      }

      this.send('clearError');
      this.set('testing', true);

      var model = this.get('model');
      model.setProperties({
        name: this.get('adminName'),
        accessMode: 'unrestricted',
        username: this.get('adminPublicValue'),
        password: this.get('adminSecretValue'),
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
      var code = this.get('adminPublicValue')+':'+this.get('adminSecretValue');
      this.get('access').login(code).then(res => {
        this.send('authenticationSucceeded', res.body);
      }).catch(err => {
        this.send('gotError', err);
      });
    },

    authenticationSucceeded: function(/*auth*/) {
      this.send('clearError');

      // Set this to true so the token will be sent with the request
      this.set('access.enabled', true);

      var model = this.get('model');
      model.setProperties({
        enabled: true,
      });

      model.save().then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.set('access.enabled', false);
        this.send('gotError', err);
      });
    },

    waitAndRefresh: function(url) {
      $('#loading-underlay, #loading-overlay').removeClass('hide').show();
      setTimeout(function() {
        window.location.href = url || window.location.href;
      }, 1000);
    },

    promptDisable: function() {
      this.set('confirmDisable', true);
      Ember.run.later(this, function() {
        this.set('confirmDisable', false);
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

      this.set('testing', false);
      this.set('saving', false);
    },

    showError: function(msg) {
      this.set('errors', [msg]);
      window.scrollY = 0;
    },

    clearError: function() {
      this.set('errors', null);
    },

    disable: function() {
      this.send('clearError');

      var model = this.get('model');
      model.setProperties({
        enabled: false,
        username: "",
        password: "",
      });

      model.save().then(() => {
        this.get('access').clearSessionKeys();
        this.set('access.enabled',false);
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('confirmDisable', false);
      });
    },
  },
  headerText: Ember.computed('access.enabled', function() {
    let out = this.get('intl').findTranslationByKey('authPage.localAuth.header.disabled');
    if (this.get('access.enabled')) {
      out = this.get('intl').findTranslationByKey('authPage.localAuth.header.enabled');

    }
    return this.get('intl').formatHtmlMessage(out);
  }),
});
