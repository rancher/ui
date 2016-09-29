import Ember from 'ember';
import C from 'ui/utils/constants';
import { denormalizeName } from 'ui/services/settings';

export default Ember.Controller.extend({
  github                  : Ember.inject.service(),
  endpoint                : Ember.inject.service(),
  access                  : Ember.inject.service(),
  settings                : Ember.inject.service(),

  confirmDisable          : false,
  errors                  : null,
  testing                 : false,
  error                   : null,

  organizations           : null,
  scheme                  : Ember.computed.alias('model.scheme'),
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

  providerName: function() {
    if ( !!this.get('model.hostname') ) {
      return 'authPage.github.enterprise';
    } else {
      return 'authPage.github.standard';
    }
  }.property('model.hostname'),

  numUsers: function() {
    return this.get('model.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_USER).get('length');
  }.property('model.allowedIdentities.@each.externalIdType','wasRestricted'),

  numOrgs: function() {
    return this.get('model.allowedIdentities').filterBy('externalIdType',C.PROJECT.TYPE_GITHUB_ORG).get('length');
  }.property('model.allowedIdentities.@each.externalIdType','wasRestricted'),

  destinationUrl: function() {
    return window.location.origin+'/';
  }.property(),

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
        this.send('authenticationSucceeded', res.body);
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
    },

    showError: function(msg) {
      this.set('errors', [msg]);
      window.scrollY = 10000;
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
  },
});
