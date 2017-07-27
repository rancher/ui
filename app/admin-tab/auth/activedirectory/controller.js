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

  providerName: 'ldap.providerName.ad',
  userType: C.PROJECT.TYPE_LDAP_USER,
  groupType: C.PROJECT.TYPE_LDAP_GROUP,

  addUserInput: '',
  addOrgInput: '',

  username: '',
  password: '',

  createDisabled: function() {
    return !this.get('username.length') || !this.get('password.length');
  }.property('username.length','password.length'),

  numUsers: function() {
    return (this.get('model.allowedIdentities')||[]).filterBy('externalIdType', this.get('userType')).get('length');
  }.property('model.allowedIdentities.@each.externalIdType','userType','groupType'),

  numGroups: function() {
    return (this.get('model.allowedIdentities')||[]).filterBy('externalIdType', this.get('groupType')).get('length');
  }.property('model.allowedIdentities.@each.externalIdType','userType','groupType'),

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
        'accessMode': 'unrestricted',
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
        this.send('authenticationSucceeded', res.body);
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
        'enabled': true,
        'accessMode': 'unrestricted',
        'allowedIdentities': [auth.userIdentity],
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
      this.set('errors', [Errors.stringify(err)]);
      this.set('testing', false);
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
