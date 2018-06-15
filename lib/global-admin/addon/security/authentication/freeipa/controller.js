import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import Errors from 'ui/utils/errors';
import C from 'ui/utils/constants';
import { alias } from '@ember/object/computed';
import { get, set, computed, observer, setProperties } from '@ember/object';

const PLAIN_PORT = 389;
const TLS_PORT = 636;

export default Controller.extend({
  userType:       C.PROJECT.TYPE_OPENLDAP_USER,
  groupType:      C.PROJECT.TYPE_OPENLDAP_GROUP,
  access:         service(),
  settings:       service(),

  confirmDisable: false,
  editing:        false,
  testing:        false,
  isActiveDirectory:     false,
  errors:         null,

  addUserInput:   '',
  addOrgInput:    '',

  username:       '',
  password:       '',
  providerName:   'ldap.providerName.freeipa',
  isEnabled:      alias('model.freeipaConfig.enabled'),
  adConfig:       alias('model.freeipaConfig'),

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
    var on = (get(this, 'adConfig.tls')||false);
    var port = parseInt(get(this, 'adConfig.port'),10);

    if ( on && port === PLAIN_PORT )
    {
      set(this, 'adConfig.port', TLS_PORT);
    }
    else if ( !on && port === TLS_PORT )
    {
      set(this, 'adConfig.port', PLAIN_PORT);
      set(this, 'adConfig.tls', false);
    }
  }),

  actions: {
    edit() {
      set(this, 'editing', true);
    },

    test() {
      this.send('clearError');

      const model = get(this, 'adConfig');

      setProperties(model, {
        accessMode: 'unrestricted',
        // todo this will go back to being a nested object
        username:   get(this, 'username'),
        password:   get(this, 'password'),
      });

      const errors = model.validationErrors();

      if ( errors.get('length') ) {

        setProperties(this, {
          errors: errors,
          testing: false
        })
        set(model, 'enabled', false);

      } else {

        // old nested style of config that is coming back on teh next build
        // {
        //   config: model,
        //   enabled:               true,
        //   username:              get(this, 'username'),
        //   password:              get(this, 'password'),
        // }
        set(model, 'enabled', true);
        set(this, 'testing', true);

        model.doAction('testAndApply', model).then( () => {

          this.send('waitAndRefresh');

        }).catch((err) => {

          model.set('enabled', false);

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
