import Ember from 'ember';
import Errors from 'ui/utils/errors';
import C from 'ui/utils/constants';

var PLAIN_PORT = 389;
var TLS_PORT   = 636;

export default Ember.Controller.extend({
  access:         Ember.inject.service(),
  settings:       Ember.inject.service(),

  confirmDisable: false,
  errors:         null,
  testing:        false,

  providerName:   'ldap.providerName.ad',
  userType:       C.PROJECT.TYPE_LDAP_USER,
  groupType:      C.PROJECT.TYPE_LDAP_GROUP,
  ldapConfig:     Ember.computed.alias('model.ldapConfig'),

  addUserInput:   '',
  addOrgInput:    '',

  username:       '',
  password:       '',
  editing:        false,
  advancedOpen:   false,

  createDisabled: Ember.computed('username.length','password.length', function() {
    return !this.get('username.length') || !this.get('password.length');
  }),

  numUsers: Ember.computed('model.allowedIdentities.@each.externalIdType','userType','groupType', function() {
    return (this.get('model.allowedIdentities')||[]).filterBy('externalIdType', this.get('userType')).get('length');
  }),

  numGroups: Ember.computed('model.allowedIdentities.@each.externalIdType','userType','groupType', function() {
    return (this.get('model.allowedIdentities')||[]).filterBy('externalIdType', this.get('groupType')).get('length');
  }),

  canEdit: Ember.computed('access.enabled', 'editing', function() {
    var isEnabled = this.get('access.enabled');
    var editing   = this.get('editing');

    if (( isEnabled && editing ) || !isEnabled) {
      return true;
    } else if (isEnabled && !editing) {
      return false;
    }

  }),

  tlsChanged: Ember.observer('ldapConfig.tls', function() {
    var on   = this.get('ldapConfig.tls');
    var port = parseInt(this.get('ldapConfig.port'),10);

    if ( on && port === PLAIN_PORT )
    {
      this.set('ldapConfig.port', TLS_PORT);
    }
    else if ( !on && port === TLS_PORT )
    {
      this.set('ldapConfig.port', PLAIN_PORT);
    }
  }),

  testConfig: function(data) {
    return this.get('authStore').request({
      url:    'testlogin',
      method: 'POST',
      data:   data,
    });
  },


  actions: {
    showAdvanced: function() {
      let open = this.get('advancedOpen');

      if (open) {
        Ember.$('.custom-schema').hide();
        this.set('advancedOpen', false);
      } else {
        Ember.$('.custom-schema').show();
        this.set('advancedOpen', true);
      }

    },
    edit: function() {
      this.toggleProperty('editing');
      this.set('originalModel', this.get('model').clone());
      this.set('username', this.get('model.identity.login'));
    },
    cancel: function() {
      this.send('clearError');
      this.set('editing', false);
      this.set('model', this.get('originalModel'));
    },
    test: function() {
      this.send('clearError');

      let model   = this.get('model');
      let editing = this.get('editing');

      if (!editing) {
        model.setProperties({
          'provider'          : 'ldapconfig',
          'enabled'           : false, // It should already be, but just in case..
          'accessMode'        : 'unrestricted',
          'allowedIdentities' : [],
        });
      }

      var errors = model.validationErrors();


      let data  = {
        type:       'testAuthConfig',
        authConfig: model,
        code:       `:${this.get('password')}`,
      };

      if ( errors.get('length') ) {
        this.set('errors', errors);
      } else {
        this.set('testing', true);

        if (editing) {
          this.testConfig(data).then(() => {
            model.save().then(() => {
              this.send('waitAndRefresh');
            }).catch((err) => {
              this.send('gotError', err);
            });
          }).catch((err) => {
            this.send('gotError', err);
          });
        } else {
          this.set('testing', true);
          model.save().then(() => {
            this.send('authenticate');
          }).catch(err => {
            this.send('gotError', err);
          });
        }
      }
    },

    authenticate: function() {
      this.send('clearError');

      var code = `${this.get('username')}:${this.get('password')}`;

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
        'enabled':           true,
        'accessMode':        'unrestricted',
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
