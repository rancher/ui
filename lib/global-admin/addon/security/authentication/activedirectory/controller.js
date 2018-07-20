import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import { alias } from '@ember/object/computed';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import AuthMixin from 'global-admin/mixins/authentication';

var PLAIN_PORT = 389;
var TLS_PORT = 636;

export default Controller.extend(AuthMixin, {
  access:            service(),
  settings:          service(),

  confirmDisable:    false,
  errors:            null,
  testing:           false,

  providerName:      'ldap.providerName.ad',
  providerSaveLabel: 'ldap.providerName.saveLabels.ad',
  addUserInput:      '',
  addOrgInput:       '',

  username:          '',
  password:          '',
  editing:           false,

  authConfig:          alias('model.activeDirectory'),
  init() {
    this._super(...arguments);
    if (get(this, 'authConfig')){
      this.tlsChanged();
    }
  },

  actions: {
    test() {
      this.send('clearError');

      const model = get(this, 'authConfig');
      const am    = get(model, 'accessMode') || 'unrestricted';

      setProperties(model, { accessMode: am, });

      var errors = model.validationErrors();

      if ( errors.get('length') ) {
        setProperties(this, {
          errors,
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
  },
  tlsChanged: observer('authConfig.tls', function() {
    const on       = (get(this, 'authConfig.tls') || false);
    const port     = parseInt(get(this, 'authConfig.port'), 10);
    const authConfig = get(this, 'authConfig');

    if ( on && port === PLAIN_PORT ) {
      set(this, 'authConfig.port', TLS_PORT);
    } else if ( !on && port === TLS_PORT ) {
      setProperties(authConfig, {
        port: PLAIN_PORT,
        tls:  false
      });
    }
  }),

  createDisabled: computed('username.length', 'password.length', function() {
    return !get(this, 'username.length') || !get(this, 'password.length');
  }),

  numUsers: computed('authConfig.allowedPrincipalIds.[]', 'userType', 'groupType', function() {
    return ( get(this, 'authConfig.allowedPrincipalIds') || [] ).filter((principal) => principal.includes(C.PROJECT.TYPE_ACTIVE_DIRECTORY_USER)).get('length');
  }),

  numGroups: computed('authConfig.allowedPrincipalIds.[]', 'userType', 'groupType', function() {
    return ( get(this, 'authConfig.allowedPrincipalIds') || [] ).filter((principal) => principal.includes(C.PROJECT.TYPE_ACTIVE_DIRECTORY_GROUP)).get('length');
  }),

  configServers: computed('authConfig.servers', {
    get() {
      return (get(this, 'authConfig.servers') || []).join(',');
    },
    set(key, value) {
      set(this, 'authConfig.servers', value.split(','));

      return value;
    }
  }),

  userType:          C.PROJECT.TYPE_LDAP_USER,
  groupType:         C.PROJECT.TYPE_LDAP_GROUP,

});
