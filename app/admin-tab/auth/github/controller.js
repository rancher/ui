import Ember from 'ember';
import C from 'ui/utils/constants';
import { denormalizeName } from 'ui/services/settings';

export default Ember.Controller.extend({
  github: Ember.inject.service(),
  endpoint: Ember.inject.service(),
  access: Ember.inject.service(),

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
    if ( this.get('isEnterprise') && !this.get('model.hostname') )
    {
      return true;
    }

    var id = (this.get('model.clientId')||'').trim();
    var secret = (this.get('model.clientSecret')||'').trim();
    return id.length < 20 ||secret.length < 40 || this.get('testing');
  }.property('model.{clientId,clientSecret,hostname}','testing','isEnterprise'),

  saveDisabled: Ember.computed.or('saving','saved'),
  isRestricted: Ember.computed.equal('model.accessMode','restricted'),

  wasRestricted: Ember.computed.equal('originalModel.accessMode','restricted'),
  wasRestrictedMsg: function() {
    var users = this.get('originalModel.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_USER).get('length');
    var orgs = this.get('originalModel.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_ORG).get('length');
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
  }.property('originalModel.allowedIdentities.[]','wasRestricted'),

  allowedActualIdentities: Ember.computed.alias('model.allowedIdentities'),

  wasShowing: false,
  showingAccessControl: function() {
    var show = this.get('wasShowing');
    var restricted = this.get('isRestricted');

    if ( restricted )
    {
      if ( this.get('allowedActualIdentities.length') > 1 )
      {
        show = true;
      }
      else if ( this.get('allowedActualIdentities.firstObject.id') !== this.get('access.identity.id') )
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
  }.property('allowedActualIdentities.@each.id','isRestricted','wasShowing'),

  destinationUrl: function() {
    return window.location.origin+'/';
  }.property(),

  accessModeChanged: function() {
    this.set('saved',false);
  }.observes('model.accessMode'),

  isEnterprise: false,
  enterpriseDidChange: function() {
    if ( !this.get('isEnterprise') )
    {
      this.set('hostname', null);
    }
  }.observes('isEnterprise'),

  protocolChoices: [
    {label: 'https:// -- Requires a cert from a public CA', value: 'https://'},
    {label: 'http://', value: 'http://'},
  ],

  hostnameDidChange: function() {
    var cur = this.get('model.hostname')||'';
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
        'allowedIdentities': [],
      });

      // Send authenticate immediately so that the popup isn't blocked,
      // even though the config isn't necessarily saved yet...
      this.set('github.hostname', model.get('hostname'));
      this.set('github.clientId', model.get('clientId'));
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
      this.get('access').login(code).then(res => {
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

      var model = this.get('model').clone();
      model.setProperties({
        'enabled': true,
        'accessMode': 'restricted',
        'allowedIdentities': [auth.userIdentity],
      });

      var url = window.location.href;

      model.save().then(() => {
        // Set this to true so the token will be sent with the request
        this.set('access.enabled', true);

        return this.get('store').find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
          if ( setting.get('value') )
          {
            this.send('waitAndRefresh', url);
          }
          else
          {
            // Default the api.host so the user won't have to set it in most cases
            setting.set('value', this.get('endpoint.host'));
            return setting.save().then(() => {
              this.send('waitAndRefresh', url);
            });
          }
        });
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

    githubNotFound: function(login) {
      this.send('showError',"User '"+ login + "' not found");
      this.send('removeUser',login);
    },

    removeIdentity: function(ident) {
      this.set('saved', false);
      this.get('model.allowedIdentities').removeObject(ident);
    },

    saveAuthorization: function() {
      this.send('clearError');

      if ( this.get('isRestricted') && !this.get('model.allowedIdentities.length') )
      {
        this.send('showError','Add at least one authorized user or organization');
        return;
      }

      this.set('saving', true);
      this.set('saved', false);

      var model = this.get('model');
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

      var model = this.get('model').clone();
      model.setProperties({
        'allowedIdentities': [],
        'accessMode': 'unrestricted',
        'enabled': false,
        'hostname': null,
        'clientSecret': '',
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

    showAccessControl: function() {
      this.set('wasShowing',true);
    },
  },
});
