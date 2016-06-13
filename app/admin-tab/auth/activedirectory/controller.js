import Ember from 'ember';
import Errors from 'ui/utils/errors';
import C from 'ui/utils/constants';

var PLAIN_PORT = 389;
var TLS_PORT = 636;

export default Ember.Controller.extend({
  access: Ember.inject.service(),
  settings: Ember.inject.service(),

  confirmDisable: false,
  errors: null,
  testing: false,
  saving: false,
  saved: true,
  error: null,
  originalModel: null,

  providerName: 'ldap.providerName.ad',

  addUserInput: '',
  addOrgInput: '',

  username: '',
  password: '',

  createDisabled: function() {
    return !this.get('username.length') || !this.get('password.length');
  }.property('username.length','password.length'),

  saveDisabled: Ember.computed.or('saving','saved'),
  isRestricted            : Ember.computed.equal('model.accessMode','restricted'),
  wasRestricted           : Ember.computed.equal('originalModel.accessMode','restricted'),
  allowedActualIdentities : Ember.computed.alias('model.allowedIdentities'),

  wasUsers: function() {
    return this.get('originalModel.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_USER).get('length');
  }.property('originalModel.allowedIdentities.@each.externalIdType','wasRestricted'),

  wasOrgs: function() {
    return this.get('originalModel.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_ORG).get('length');
  }.property('originalModel.allowedIdentities.@each.externalIdType','wasRestricted'),

  accessModeChanged: function() {
    if ( !this.get('model.allowedIdentities') ) {
      this.set('model.allowedIdentities', []);
    }
    this.set('saved',false);
  }.observes('model.accessMode'),

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

      var model = this.get('model');
      model.setProperties({
        enabled: false,
      });

      var errors = model.validationErrors();
      if ( errors.get('length') )
      {
        this.set('errors', errors);
      }
      else
      {
        this.set('testing', true);
        model.save().then(() => {
          this.send('authenticate');
        }).catch(err => {
          this.send('gotError', err);
        });
      }
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

    addAuthorized: function(data) {
      this.send('clearError');
      this.set('saved', false);
      this.get('model.allowedIdentities').pushObject(data);
    },

    removeIdentity: function(ident) {
      this.set('saved', false);
      this.get('model.allowedIdentities').removeObject(ident);
    },

    saveAuthorization: function() {
      this.send('clearError');

      if ( this.get('isRestricted') && !this.get('model.allowedIdentities.length') )
      {
        this.send('showError','Add at least one authorized user or group');
        return;
      }

      this.set('saving', true);
      this.set('saved', false);

      let model = this.get('model');
      model.save().then(() => {
        this.get('originalModel').replaceWith(model);
        this.set('originalModel.allowedIdentities', this.get('model.allowedIdentities').slice());
        this.set('saved', true);
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('saving', false);
      });
    },

    promptDisable: function() {
      this.set('confirmDisable', true);
      Ember.run.later(this, function() {
        this.set('confirmDisable', false);
      }, 10000);
    },

    gotError: function(err) {
      this.set('errors', [Errors.stringify(err)]);
      this.set('testing', false);
      this.set('saving', false);
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
