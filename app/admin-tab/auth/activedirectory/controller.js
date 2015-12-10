import Ember from 'ember';

var PLAIN_PORT = 389;
var TLS_PORT = 636;

export default Ember.Controller.extend({
  access: Ember.inject.service(),

  confirmDisable: false,
  errors: null,
  testing: false,
  saving: false,
  saved: true,
  error: null,
  originalModel: null,

  providerName: 'Active Directory',

  addUserInput: '',
  addOrgInput: '',

  username: '',
  password: '',

  createDisabled: function() {
    return !this.get('username.length') || !this.get('password.length');
  }.property('username.length','password.length'),

  saveDisabled: Ember.computed.or('saving','saved'),

  tlsChanged: function() {
    var on = this.get('model.tls');
    var port = parseInt(this.get('model.port'),10);

    if ( on && port === PLAIN_PORT )
    {
      this.set('model.port', TLS_PORT);
    }
    else if ( !on && port === TLS_PORT )
    {
      this.set('model.port', PLAIN_PORT);
    }
  }.observes('model.tls'),

  actions: {
    test: function() {
      this.send('clearError');
      this.set('testing', true);

      var model = this.get('model');
      model.setProperties({
        enabled: false,
      });


      model.save().then(() => {
        this.send('authenticate');
      }).catch(err => {
        this.send('gotError', err);
      });
    },

    authenticate: function() {
      this.send('clearError');
      var code = this.get('username')+':'+this.get('password');
      this.get('access').login(code).then(res => {
        var auth = JSON.parse(res.xhr.responseText);
        this.send('authenticationSucceeded', auth);
      }).catch(err => {
        this.send('gotError', err);
      });
    },

    authenticationSucceeded: function(auth) {
      this.send('clearError');
      this.set('organizations', auth.orgs);

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

    addAuthorized: function(/*data*/) {
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
});
