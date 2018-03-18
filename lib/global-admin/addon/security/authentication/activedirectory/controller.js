import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import Errors from 'ui/utils/errors';
import C from 'ui/utils/constants';
import { alias } from '@ember/object/computed';
import { computed, observer } from '@ember/object';

var PLAIN_PORT = 389;
var TLS_PORT = 636;

export default Controller.extend({
  access: service(),
  settings: service(),

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
  isEnabled: alias('model.activeDirectory.enabled'),
  adConfig: alias('model.activeDirectory'),

  init() {
    this._super(...arguments);
    if (this.get('adConfig')){
      this.tlsChanged();
    }
  },
  createDisabled: computed('username.length','password.length', function() {
    return !this.get('username.length') || !this.get('password.length');
  }),

  numUsers: computed('adConfig.allowedIdentities.@each.externalIdType','userType','groupType', function() {
    return (this.get('adConfig.allowedIdentities')||[]).filterBy('externalIdType', this.get('userType')).get('length');
  }),

  numGroups: computed('adConfig.allowedIdentities.@each.externalIdType','userType','groupType', function() {
    return (this.get('adConfig.allowedIdentities')||[]).filterBy('externalIdType', this.get('groupType')).get('length');
  }),

  configServers: computed('adConfig.servers', {
    get() {
      return (this.get('adConfig.servers')||[]).join(',');
    },
    set(key, value) {
      this.set('adConfig.servers', value.split(','));
      return value;
    }
  }),

  tlsChanged: observer('adConfig.tls', function() {
    var on = (this.get('adConfig.tls')||false);
    var port = parseInt(this.get('adConfig.port'),10);

    if ( on && port === PLAIN_PORT )
    {
      this.set('adConfig.port', TLS_PORT);
    }
    else if ( !on /* && port === TLS_PORT */ ) // TODO 2.0
    {
      this.set('adConfig.port', PLAIN_PORT);
      this.set('adConfig.tls', false);
    }
  }),

  actions: {
    test: function() {
      this.send('clearError');

      var model = this.get('adConfig');
      model.setProperties({
        accessMode: 'unrestricted',
      });

      var errors = model.validationErrors();
      if ( errors.get('length') )
      {
        this.set('errors', errors);
      }
      else
      {
        this.set('testing', true);
        model.doAction('testAndApply', {
          activeDirectoryConfig: model,
          enabled: true,
          username: this.get('username'),
          password: this.get('password'),
        }).then( () => {
          this.send('waitAndRefresh');
        }).catch((err) => {
          model.set('enabled', false);
          this.send('gotError', err);
        });
      }
    },

    waitAndRefresh: function(url) {
      $('#loading-underlay, #loading-overlay').removeClass('hide').show();
      setTimeout(function() {
        window.location.href = url || window.location.href;
      }, 1000);
    },

    promptDisable: function() {
      this.set('confirmDisable', true);
      later(this, function() {
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

      var model = this.get('adConfig');
      model.setProperties({
        enabled: false,
      });


      model.doAction('disable').then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        this.set('confirmDisable', false);
      });
    },
  },
});
