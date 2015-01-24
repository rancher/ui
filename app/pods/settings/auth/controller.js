import Ember from 'ember';
import config from 'torii/configuration';
import githubOauth from 'torii/providers/github-oauth2';
import util from 'ui/utils/util';

export default Ember.ObjectController.extend({
  confirmDisable: false,
  error: null,
  testing: false,
  saving: false,
  saved: true,

  createDisabled: function() {
    var id = (this.get('clientId')||'').trim();
    var secret = (this.get('clientSecret')||'').trim();
    return id.length < 20 ||secret.length < 40 || this.get('testing');
  }.property('clientId','clientSecret','testing'),

  saveDisabled: Ember.computed.or('saving','saved'),

  destinationUrl: function() {
    return window.location.origin+'/';
  }.property(),

  actions: {
    test: function() {
      var self = this;
      self.send('clearError');
      self.set('testing', true);

      var model = self.get('model');
      model.setProperties({
        'clientId': model.get('clientId').trim(),
        'clientSecret': model.get('clientSecret').trim(),
        'enabled': false, // It should already be, but just in case..
        'allowedOrganizations': [],
        'allowedUsers': []
      });

      // Send authenticate immediately so that the popup isn't blocked,
      // even though the config isn't necessarily saved yet...
      self.send('authenticate');

      model.save().catch(function(err) {
        self.set('testing', false);
        self.send('gotError', err);
      });
    },

    authenticate: function() {
      var self = this;
      self.send('clearError');

      config.providers['github-oauth2'].apiKey = this.get('model.clientId');
      githubOauth.state = Math.random()+"";

      self.get('torii').open('github-oauth2',{windowOptions: util.popupWindowOptions()}).then(function(github){
        return self.get('store').rawRequest({
          url: 'token',
          method: 'POST',
          data: {
            code: github.authorizationCode,
          }
        }).then(function(res) {
          var auth = JSON.parse(res.xhr.responseText);
          self.send('authenticationSucceeded', auth);
        }).catch(function(res) {
          // Github auth succeeded but didn't get back a token
          var err = JSON.parse(res.xhr.responseText);
          self.send('gotError', err);
        });
      })
      .catch(function(err) {
        // Github auth failed.. try again
        self.send('gotError', err);
      })
      .finally(function() {
        self.set('testing', false);
      });
    },

    authenticationSucceeded: function(auth) {
      var self = this;
      self.send('clearError');

      var session = self.get('session');
      session.set('token', auth.jwt);
      session.set('isLoggedIn', 1);

      var model = self.get('model');
      model.setProperties({
        'enabled': true,
        'allowedOrganizations': auth.orgs||[],
        'allowedUsers': [auth.user],
      });

      model.save().then(function() {
        self.send('waitAndRefresh', true);
      }).catch(function() {
        // @TODO something
      });
    },

    waitAndRefresh: function(expect,limit) {
      var self = this;
      if ( limit === undefined )
      {
        limit = 5;
      }
      else if ( limit === 0 )
      {
        self.send('error', 'Timed out waiting for access control to turn ' + (expect ? 'on' : 'off'));
        return;
      }

      setTimeout(function() {
        self.get('store').rawRequest({
          url: 'schemas',
          headers: { 'authorization': undefined }
        }).then(function() {
          if ( expect === false )
          {
            window.location.href = window.location.href;
          }
          else
          {
            self.send('waitAndRefresh',expect,limit-1);
          }
        }).catch(function() {
          if ( expect === true )
          {
            window.location.href = window.location.href;
          }
          else
          {
            self.send('waitAndRefresh',expect,limit-1);
          }
        });
      }, 5000/limit);
    },

    addUser: function() {
      this.send('clearError');
      this.set('saved', false);

      var str = (this.get('addUser')||'').trim();
      if ( str )
      {
        this.get('allowedUsers').pushObject(str);
        this.set('addUser','');
      }
    },

    removeUser: function(login) {
      this.set('saved', false);
      this.get('allowedUsers').removeObject(login);
    },

    addOrg: function() {
      this.send('clearError');
      this.set('saved', false);

      var str = (this.get('addOrg')||'').trim();
      if ( str )
      {
        this.get('allowedOrganizations').pushObject(str);
        this.set('addOrg','');
      }
    },

    removeOrg: function(login) {
      this.set('saved', false);
      this.get('allowedOrganizations').removeObject(login);
    },

    userNotFound: function(login) {
      this.send('showError',"User '"+ login + "' not found");
      this.send('removeUser',login);
    },

    orgNotFound: function(login) {
      this.send('showError',"Organization '"+ login + "' not found");
      this.send('removeOrg',login);
    },

    saveAuthorization: function() {
      var self = this;
      self.send('clearError');
      self.set('saving', true);
      self.set('saved', false);

      var model = self.get('model');
      model.save().then(function() {
        self.set('saved', true);
      }).catch(function(err) {
        self.send('gotError', err);
      }).finally(function() {
        self.set('saving', false);
      });
    },

    promptDisable: function() {
      this.set('confirmDisable', true);
    },

    gotError: function(err) {
      if ( err.message )
      {
        this.send('showError', err.message);
      }
      else
      {
        this.send('showError', 'Error ('+err.status + ' - ' + err.code+')');
      }
    },

    showError: function(msg) {
      this.set('error', msg);
      window.scrollY = 0;
    },

    clearError: function() {
      this.set('error', '');
    },

    disable: function() {
      var self = this;
      self.send('clearError');

      var model = this.get('model');
      model.setProperties({
        'allowedOrganizations': [],
        'allowedUsers': [],
        'enabled': false,
      });

      model.save().then(function() {
        self.send('waitAndRefresh', false);
      }).catch(function(err) {
        self.send('gotError', err);
      });
    },
  },
});
