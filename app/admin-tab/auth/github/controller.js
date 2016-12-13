import Ember from 'ember';
import C from 'ui/utils/constants';
import { denormalizeName } from 'ui/services/settings';

export default Ember.Controller.extend({
  github                  : Ember.inject.service(),
  endpoint                : Ember.inject.service(),
  access                  : Ember.inject.service(),
  settings                : Ember.inject.service(),
  githubConfig            : Ember.computed.alias('model.githubConfig'),

  confirmDisable          : false,
  errors                  : null,
  testing                 : false,
  error                   : null,
  saved                   : false,
  saving                  : false,
  haveToken               : false,

  organizations           : null,
  scheme                  : Ember.computed.alias('githubConfig.scheme'),
  isEnterprise: false,
  secure : true,

  createDisabled: function() {
    if (!this.get('haveToken')) {
      return true;
    }
    if ( this.get('isEnterprise') && !this.get('githubConfig.hostname') )
    {
      return true;
    }

    if ( this.get('testing') )
    {
      return true;
    }

  }.property('githubConfig.{clientId,clientSecret,hostname}','testing','isEnterprise', 'haveToken'),

  providerName: function() {
    if ( !!this.get('githubConfig.hostname') ) {
      return 'authPage.github.enterprise';
    } else {
      return 'authPage.github.standard';
    }
  }.property('githubConfig.hostname'),

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
      var hostname = this.get('githubConfig.hostname')||'';

      if ( match = hostname.match(/^http(s)?:\/\//i) ) {
        this.set('secure', ((match[1]||'').toLowerCase() === 's'));
        hostname = hostname.substr(match[0].length).replace(/\/.*$/,'');
        this.set('githubConfig.hostname', hostname);
      }

    }
    else
    {
      this.set('githubConfig.hostname', null);
      this.set('secure', true);
    }

    this.set('scheme', this.get('secure') ? 'https://' : 'http://');
  },

  enterpriseDidChange: function() {
    Ember.run.once(this,'updateEnterprise');
  }.observes('isEnterprise','githubConfig.hostname','secure'),

  protocolChoices: [
    {label: 'https:// -- Requires a cert from a public CA', value: 'https://'},
    {label: 'http://', value: 'http://'},
  ],

  actions: {
    save: function() {
      this.send('clearError');
      this.set('saving', true);

      let githubConfig = Ember.Object.create(this.get('githubConfig'));
      githubConfig.setProperties({
        'clientId'          : (githubConfig.get('clientId')||'').trim(),
        'clientSecret'      : (githubConfig.get('clientSecret')||'').trim(),
      });


      this.get('model').setProperties({
        'provider'          : 'githubconfig',
        'enabled'           : false, // It should already be, but just in case..
        'accessMode'        : 'unrestricted',
        'allowedIdentities' : [],
      });

      this.get('github').setProperties({
        hostname : githubConfig.get('hostname'),
        scheme   : githubConfig.get('scheme'),
        clientId : githubConfig.get('clientId')
      });

      this.get('model').save().then((/*resp*/) => {
        // we need to go get he new token before we open the popup
        // if you've authed with any other services in v1-auth
        // the redirect token will be stale and representitive
        // of the old auth method
        this.get('github').getToken().then((resp) => {
          this.get('access').set('token', resp);
          this.setProperties({
            saving: false,
            saved: true,
            haveToken: true,
          });
        }).catch((err) => {
          this.setProperties({
            saving: false,
            saved: false,
            haveToken: false,
          });
          this.send('gotError', err);
        });
      }).catch(err => {
          this.setProperties({
            saving: false,
            saved: false,
            haveToken: false,
          });
        this.send('gotError', err);
      });
    },

    authenticate: function() {
      this.send('clearError');
      this.set('testing', true);
      this.get('github').authorizeTest((err,code) => {
        if ( err )
        {
          this.send('gotError', err);
          this.set('testing', false);
        }
        else
        {
          this.send('gotCode', code);
          this.set('testing', false);
        }
      });
    },

    gotCode: function(code) {
      this.get('access').login(code).then(res => {
        this.send('authenticationSucceeded', res.body);
      }).catch(res => {
        // Github auth succeeded but didn't get back a token
        this.send('gotError', res.body);
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
        'githubConfig': {
          'hostname': null,
          'clientSecret': '',
        }
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
