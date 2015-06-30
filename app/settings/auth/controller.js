import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.ObjectController.extend({
  github: Ember.inject.service(),
  endpoint: Ember.inject.service(),

  confirmDisable: false,
  errors: null,
  testing: false,
  saving: false,
  saved: true,
  error: null,
  originalModel: null,

  organizations: null,
  addUserInput: '',
  addOrgInput: '',

  createDisabled: function() {
    if ( this.get('isEnterprise') && !this.get('hostname') )
    {
      return true;
    }

    var id = (this.get('clientId')||'').trim();
    var secret = (this.get('clientSecret')||'').trim();
    return id.length < 20 ||secret.length < 40 || this.get('testing');
  }.property('clientId','clientSecret','testing','hostname','isEnterprise'),

  saveDisabled: Ember.computed.or('saving','saved'),
  isRestricted: Ember.computed.equal('accessMode','restricted'),

  wasRestricted: Ember.computed.equal('originalModel.accessMode','restricted'),
  wasRestrictedMsg: function() {
    var users = this.get('originalModel.allowedUsers.length');
    var orgs = this.get('originalModel.allowedOrganizations.length');
    var enterprise = !!this.get('originalModel.hostname');

    var github = 'GitHub' + ( enterprise ? ' Enterprise' : '');

    var str = 'project members';
    if ( users )
    {
      str += (orgs ? ', ' : ' and ') +  users + ' ' + github + ' user' + (users === 1 ? '' : 's');
    }

    if ( orgs )
    {
      str += ' and ' + orgs + (users ? '' : ' ' + github) + ' organization' + ( orgs === 1 ? '' : 's');
    }

    return str;
  }.property('originalModel.allowedUsers.[]','originalModel.allowedOrganizations.[]','wasRestricted'),

  wasShowing: false,
  showingAccessControl: function() {
    var show = this.get('wasShowing');
    var restricted = this.get('isRestricted');

    if ( restricted )
    {
      if ( (this.get('allowedUsers.length') + this.get('allowedOrganizations.length')) > 1 )
      {
        show = true;
      }
      else if ( this.get('allowedUsers.firstObject') !== this.get('session').get(C.SESSION.USER_ID) )
      {
        show = true;
      }
    }
    else
    {
      show = true;
    }


    this.set('wasShowing', show);
    return show;
  }.property('allowedUsers.[]','allowedOrganizations.[]','isRestricted','wasShowing'),

  destinationUrl: function() {
    return window.location.origin+'/';
  }.property(),

  accessModeChanged: function() {
    this.set('saved',false);
  }.observes('accessMode'),

  isEnterprise: false,
  enterpriseDidChange: function() {
    if ( !this.get('isEnterprise') )
    {
      this.set('hostname', null);
    }
  }.observes('isEnterprise'),

  hostnameDidChange: function() {
    var cur = this.get('hostname')||'';
    var neu = cur.replace(/^https?:\/\//ig,'').replace(/\/.*$/,'');
    if ( cur !== neu )
    {
      this.set('hostname', neu);
    }
  }.observes('hostname'),

  actions: {
    test: function() {
      this.send('clearError');
      this.set('testing', true);

      var model = this.get('model');
      model.setProperties({
        'clientId': model.get('clientId').trim(),
        'clientSecret': model.get('clientSecret').trim(),
        'enabled': false, // It should already be, but just in case..
        'accessMode': 'unrestricted',
        'allowedOrganizations': [],
        'allowedUsers': []
      });

      // Send authenticate immediately so that the popup isn't blocked,
      // even though the config isn't necessarily saved yet...
      this.set('app.githubHostname', model.get('hostname'));
      this.set('app.githubClientId', model.get('clientId'));
      this.send('authenticate');

      model.save().catch(err => {
        this.set('testing', false);
        this.send('gotError', err);
      });
    },

    authenticate: function() {
      this.send('clearError');
      this.get('github').authorizeTest((err,code) => {
        if ( err )
        {
          this.send('gotError', err);
        }
        else
        {
          this.send('gotCode', code);
        }
      });
    },

    gotCode: function(code) {
      this.get('github').login(code).then(res => {
        var auth = JSON.parse(res.xhr.responseText);
        this.send('authenticationSucceeded', auth);
      }).catch(res => {
        // Github auth succeeded but didn't get back a token
        var err = JSON.parse(res.xhr.responseText);
        this.send('gotError', err);
      });
    },

    authenticationSucceeded: function(auth) {
      this.send('clearError');
      this.set('organizations', auth.orgs);

      // Set this to true so the token will be sent with the request
      this.set('app.authenticationEnabled',true);

      // Clear the GitHub cache in case the hostname has changed
      this.get('github').clearCache();

      var model = this.get('model');
      model.setProperties({
        'enabled': true,
        'accessMode': 'restricted',
        'allowedOrganizations': [],
        'allowedUsers': [auth.user],
      });

      model.save().then(() => {
        return this.get('store').find('setting', C.SETTING.API_HOST).then((setting) => {
          if ( setting.get('value') )
          {
            this.send('waitAndRefresh');
          }
          else
          {
            // Default the api.host so the user won't have to set it in most cases
            setting.set('value', this.get('endpoint.host'));
            return setting.save().then(() => {
              this.send('waitAndRefresh');
            });
          }
        });
      }).catch((err) => {
        this.set('app.authenticationEnabled',false);
        this.send('gotError', err);
      });
    },

    waitAndRefresh: function() {
      $('#loading-underlay, #loading-overlay').removeClass('hide').show();
      setTimeout(function() {
        window.location.href = window.location.href;
      }, 1000);
    },

    addAuthorized: function(data) {
      this.send('clearError');
      this.set('saved', false);

      if ( data.type === 'user' )
      {
        this.get('allowedUsers').pushObject(data.id);
      }
      else
      {
        this.get('allowedOrganizations').pushObject(data.id);
      }
    },

    githubNotFound: function(login) {
      this.send('showError',"User '"+ login + "' not found");
      this.send('removeUser',login);
    },

    removeUser: function(login) {
      this.set('saved', false);
      this.get('allowedUsers').removeObject(login);
    },

    removeOrg: function(login) {
      this.set('saved', false);
      this.get('allowedOrganizations').removeObject(login);
    },

    saveAuthorization: function() {
      this.send('clearError');

      if ( this.get('isRestricted') && !this.get('allowedUsers.length') && !this.get('allowedOrganizations.length'))
      {
        this.send('showError','Add at least one authorized user or organization');
        return;
      }

      this.set('saving', true);
      this.set('saved', false);

      var model = this.get('model');
      model.save().then(() => {
        this.get('originalModel').replaceWith(model);
        this.set('originalModel.allowedOrganizations', this.get('allowedOrganizations').slice());
        this.set('originalModel.allowedUsers', this.get('allowedUsers').slice());
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
        'allowedOrganizations': [],
        'allowedUsers': [],
        'accessMode': 'unrestricted',
        'enabled': false,
        'hostname': null,
        'clientSecret': '',
      });


      model.save().then(() => {
        this.get('github').clearSessionKeys();
        this.set('app.authenticationEnabled',false);
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('confirmDisable', false);
      });
    },

    showAccessControl: function() {
      this.set('wasShowing',true);
    },
  },
});
