import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import Errors from 'ui/utils/errors';
import C from 'ui/utils/constants';
import { alias } from '@ember/object/computed';
import { get, set, computed, observer, setProperties } from '@ember/object';

var PLAIN_PORT = 389;
var TLS_PORT = 636;

export default Controller.extend({
  access:            service(),
  settings:          service(),

  confirmDisable:    false,
  errors:            null,
  testing:           false,

  providerName:      'ldap.providerName.ad',
  providerSaveLabel: 'ldap.providerName.saveLabels.ad',
  userType:          C.PROJECT.TYPE_LDAP_USER,
  groupType:         C.PROJECT.TYPE_LDAP_GROUP,

  addUserInput:      '',
  addOrgInput:       '',

  username:          '',
  password:          '',
  isEnabled:         alias('model.activeDirectory.enabled'),
  adConfig:          alias('model.activeDirectory'),
  editing:           false,

  init() {
    this._super(...arguments);
    if (get(this, 'adConfig')){
      this.tlsChanged();
    }
  },

  createDisabled: computed('username.length','password.length', function() {
    return !get(this, 'username.length') || !get(this, 'password.length');
  }),

  numUsers: computed('adConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return ( get(this, 'adConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_ACTIVE_DIRECTORY_USER)).get('length');
  }),

  numGroups: computed('adConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return ( get(this, 'adConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_ACTIVE_DIRECTORY_GROUP)).get('length');
  }),

  configServers: computed('adConfig.servers', {
    get() {
      return (get(this, 'adConfig.servers')||[]).join(',');
    },
    set(key, value) {
      set(this, 'adConfig.servers', value.split(','));
      return value;
    }
  }),

  tlsChanged: observer('adConfig.tls', function() {
    const on       = (get(this, 'adConfig.tls')||false);
    const port     = parseInt(get(this, 'adConfig.port'),10);
    const adConfig = get(this, 'adConfig');

    if ( on && port === PLAIN_PORT ) {

      set(this, 'adConfig.port', TLS_PORT);

    } else if ( !on && port === TLS_PORT ) {

      setProperties(adConfig, {
        port: PLAIN_PORT,
        tls: false
      });

    }
  }),

  actions: {
    edit() {
      set(this, 'editing', true);
    },

    test() {
      this.send('clearError');

      const model = get(this, 'adConfig');
      const am    = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, {
        accessMode: am,
      });

      var errors = model.validationErrors();

      if ( errors.get('length') ) {

        setProperties(this, {
          errors: errors,
          testing: false,
        });

        model.set('enabled', false);

      } else {

        set(this, 'testing', true);

        model.doAction('testAndApply', {
          activeDirectoryConfig: model,
          enabled:               true,
          username:              get(this, 'username'),
          password:              get(this, 'password'),
        }).then( () => {

          this.send('waitAndRefresh');

        }).catch((err) => {

          set(model, 'enabled', false);

          this.send('gotError', err);

        });
      }
    },

    waitAndRefresh(url) {
      $('#loading-underlay, #loading-overlay').removeClass('hide').show();  // eslint-disable-line

      setTimeout(function() {
        window.location.href = url || window.location.href;
      }, 1000);
    },

    promptDisable() {
      set(this, 'confirmDisable', true);
      later(this, function() {
        set(this, 'confirmDisable', false);
      }, 10000);
    },

    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
      set(this, 'testing', false);
    },

    clearError() {
      set(this, 'errors', null);
    },

    disable() {
      this.send('clearError');

      var model = get(this, 'adConfig');
      model.setProperties({
        enabled: false,
      });


      model.doAction('disable').then(() => {
        this.send('waitAndRefresh');
      }).catch((err) => {
        this.send('gotError', err);
      }).finally(() => {
        set(this, 'confirmDisable', false);
      });
    },
  },
});
