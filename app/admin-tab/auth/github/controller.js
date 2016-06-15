import Ember from 'ember';
import C from 'ui/utils/constants';
import { denormalizeName } from 'ui/services/settings';

export default Ember.Controller.extend({
  github                  : Ember.inject.service(),
  endpoint                : Ember.inject.service(),
  access                  : Ember.inject.service(),
  settings                : Ember.inject.service(),
  intl                    : Ember.inject.service(),

  confirmDisable          : false,
  errors                  : null,
  testing                 : false,
  saving                  : false,
  saved                   : true,
  error                   : null,
  originalModel           : null,

  organizations           : null,
  addUserInput            : '',
  addOrgInput             : '',
  scheme                  : Ember.computed.alias('model.scheme'),
  saveDisabled            : Ember.computed.or('saving','saved'),
  isRestricted            : Ember.computed.equal('model.accessMode','restricted'),
  wasRestricted           : Ember.computed.equal('originalModel.accessMode','restricted'),

  allowedActualIdentities : Ember.computed.alias('model.allowedIdentities'),

  isEnterprise: false,
  secure : true,

  createDisabled: function() {
    if ( this.get('isEnterprise') && !this.get('model.hostname') )
    {
      return true;
    }

    if ( this.get('testing') )
    {
      return true;
    }
  }.property('model.{clientId,clientSecret,hostname}','testing','isEnterprise'),

  wasLabel: function() {
    if ( !!this.get('originalModel.hostname') ) {
      return this.get('intl').t('authPage.github.enterprise');
    } else {
      return this.get('intl').t('authPage.github.standard');
    }
  }.property('originalModel.hostname','intl._lcoale'),

  wasUsers: function() {
    return this.get('originalModel.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_USER).get('length');
  }.property('originalModel.allowedIdentities.@each.externalIdType','wasRestricted'),

  wasOrgs: function() {
    return this.get('originalModel.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_ORG).get('length');
  }.property('originalModel.allowedIdentities.@each.externalIdType','wasRestricted'),

  destinationUrl: function() {
    return window.location.origin+'/';
  }.property(),

  accessModeChanged: function() {
    this.set('saved',false);
  }.observes('model.accessMode'),

  updateEnterprise: function() {
    if ( this.get('isEnterprise') ) {
      var match;
      var hostname = this.get('model.hostname')||'';

      if ( match = hostname.match(/^http(s)?:\/\//i) ) {
        this.set('secure', ((match[1]||'').toLowerCase() === 's'));
        hostname = hostname.substr(match[0].length).replace(/\/.*$/,'');
        this.set('model.hostname', hostname);
      }

    }
    else
    {
      this.set('model.hostname', null);
      this.set('secure', true);
    }

    this.set('scheme', this.get('secure') ? 'https://' : 'http://');
  },

  enterpriseDidChange: function() {
    Ember.run.once(this,'updateEnterprise');
  }.observes('isEnterprise','model.hostname','secure'),


  protocolChoices: [
    {label: 'https:// -- Requires a cert from a public CA', value: 'https://'},
    {label: 'http://', value: 'http://'},
  ],

  actions: {
    test: function() {
      this.send('clearError');
      this.set('testing', true);

      let model = this.get('model');
      model.setProperties({
        'clientId'          : (model.get('clientId')||'').trim(),
        'clientSecret'      : (model.get('clientSecret')||'').trim(),
        'enabled'           : false, // It should already be, but just in case..
        'accessMode'        : 'unrestricted',
        'allowedIdentities' : [],
      });

      // Send authenticate immediately so that the popup isn't blocked,
      // even though the config isn't necessarily saved yet...
      this.get('github').setProperties({
        hostname : model.get('hostname'),
        scheme   : model.get('scheme'),
        clientId : model.get('clientId')
      });
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
        let auth = JSON.parse(res.xhr.responseText);
        this.send('authenticationSucceeded', auth);
      }).catch(res => {
        // Github auth succeeded but didn't get back a token
        let err;
        try {
          err = JSON.parse(res.xhr.responseText);
        } catch(e) {
          err = {type: 'error', message: 'Error authenticating, check Client ID and Secret'};
        }
        this.send('gotError', err);
      });
    },

    authenticationSucceeded: function(auth) {
      this.send('clearError');
      this.set('organizations', auth.orgs);

      let model = this.get('model').clone();
      model.setProperties({
        'enabled': true,
        'accessMode': 'restricted',
        'allowedIdentities': [auth.userIdentity],
      });

      let url = window.location.href;

      model.save().then(() => {
        // Set this to true so the token will be sent with the request
        this.set('access.enabled', true);

        return this.get('userStore').find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
          if ( setting.get('value') )
          {
            this.send('waitAndRefresh', url);
          }
          else
          {
            // Default the api.host so the user won't have to set it in most cases
            if ( window.location.hostname === 'localhost' ) {
              this.send('waitAndRefresh', url);
            } else {
              setting.set('value', window.location.origin);
              return setting.save().then(() => {
                this.send('waitAndRefresh', url);
              });
            }
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

      let model = this.get('model').clone();
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
