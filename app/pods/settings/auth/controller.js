import Ember from 'ember';
import config from 'torii/configuration';
import util from 'ui/utils/util';
import C from 'ui/utils/constants';

export default Ember.ObjectController.extend({
  confirmDisable: false,
  error: null,
  testing: false,
  saving: false,
  saved: true,

  organizations: null,
  addUserInput: '',
  addOrgInput: '',

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
      this.send('clearError');
      this.set('testing', true);

      var model = this.get('model');
      model.setProperties({
        'clientId': model.get('clientId').trim(),
        'clientSecret': model.get('clientSecret').trim(),
        'enabled': false, // It should already be, but just in case..
        'allowedOrganizations': [],
        'allowedUsers': []
      });

      // Send authenticate immediately so that the popup isn't blocked,
      // even though the config isn't necessarily saved yet...
      this.send('authenticate');

      model.save().catch(err => {
        this.set('testing', false);
        this.send('gotError', err);
      });
    },

    authenticate: function() {
      this.send('clearError');

      config.providers['github-oauth2'].apiKey = this.get('model.clientId');

      var torii = this.get('torii');
      var provider = torii.container.lookup('torii-provider:github-oauth2');
      provider.set('clientId', this.get('model.clientId'));
      provider.set('state', Math.random()+"");

      torii.open('github-oauth2',{windowOptions: util.popupWindowOptions()}).then(github => {
        var headers = {};
        headers[C.AUTH_HEADER] = undefined; // Explicitly not send auth
        headers[C.PROJECT_HEADER] = undefined; // Explicitly not send project

        return this.get('store').rawRequest({
          url: 'token',
          method: 'POST',
          headers: headers,
          data: {
            code: github.authorizationCode,
          }
        }).then(res => {
          var auth = JSON.parse(res.xhr.responseText);
          this.send('authenticationSucceeded', auth);
        }).catch(res => {
          // Github auth succeeded but didn't get back a token
          var err = JSON.parse(res.xhr.responseText);
          this.send('gotError', err);
        });
      })
      .catch(err => {
        // Github auth failed.. try again
        this.send('gotError', err);
      })
      .finally(() => {
        this.set('testing', false);
      });
    },

    authenticationSucceeded: function(auth) {
      this.send('clearError');

      var session = this.get('session');
      session.setProperties(auth);
      session.set(C.LOGGED_IN, true);

      this.set('organizations', auth.orgs);

      // Set this to true so the token will be sent with the request
      this.set('app.authenticationEnabled',true);

      var model = this.get('model');
      model.setProperties({
        'enabled': true,
        'allowedOrganizations': [],
        'allowedUsers': [auth.user],
      });

      model.save().then(() => {
        this.send('waitAndRefresh', true);
      }).catch((err) => {
        this.set('app.authenticationEnabled',false);
        this.send('gotError', err);
      });
    },

    waitAndRefresh: function(expect,limit=5) {
      if ( limit === 0 )
      {
        hide();
        this.send('error', 'Timed out waiting for access control to turn ' + (expect ? 'on' : 'off'));
        return;
      }
      else
      {
        $('#loading-underlay, #loading-overlay').removeClass('hide');
      }

      setTimeout(() => {
        var headers = {};
        headers[C.AUTH_HEADER] = undefined; // Explicitly not send auth
        headers[C.PROJECT_HEADER] = undefined; // Explicitly not send project

        this.get('store').rawRequest({
          url: 'schemas',
          headers: headers
        }).then(() => {
          if ( expect === false )
          {
            window.location.href = window.location.href;
          }
          else
          {
            this.send('waitAndRefresh',expect,limit-1);
          }
        }).catch(() => {
          if ( expect === true )
          {
            window.location.href = window.location.href;
          }
          else
          {
            this.send('waitAndRefresh',expect,limit-1);
          }
        });
      }, 5000/limit);

      function hide() {
        $('#loading-underlay, #loading-overlay').addClass('hide');
      }
    },

    addUser: function() {
      this.send('clearError');
      this.set('saved', false);

      var str = (this.get('addUserInput')||'').trim();
      if ( str )
      {
        this.get('allowedUsers').pushObject(str);
        this.set('addUserInput','');
      }
    },

    removeUser: function(login) {
      this.set('saved', false);
      this.get('allowedUsers').removeObject(login);
    },

    addOrg: function(str) {
      this.send('clearError');
      this.set('saved', false);

      str = (str||'').trim();
      if ( str )
      {
        this.get('allowedOrganizations').pushObject(str);
        this.set('addOrgInput','');
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
      this.send('clearError');
      this.set('saving', true);
      this.set('saved', false);

      var model = this.get('model');
      model.save().then(() => {
        this.set('saved', true);
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('saving', false);
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
      this.send('clearError');

      var model = this.get('model');
      model.setProperties({
        'allowedOrganizations': [],
        'allowedUsers': [],
        'enabled': false,
      });


      model.save().then(() => {
        this.set('app.authenticationEnabled',false);
        this.send('waitAndRefresh', false);
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('confirmDisable', false);
      });
    },
  },
});
