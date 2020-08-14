import Component from '@ember/component';
import layout from './template';
import AuthMixin from 'global-admin/mixins/authentication';
import Saml from 'global-admin/mixins/saml-auth';
import { alias, equal } from '@ember/object/computed';
import {
  computed, get, set, observer, setProperties
} from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

var PLAIN_PORT = 389;
var TLS_PORT = 636;

export default Component.extend(AuthMixin, Saml, {
  globalStore: service(),

  layout,

  advanced:           false,
  createLabel:        null,
  editLabel:          null,
  providerName:       null,
  providerNamePath:   null,
  saveLabel:          null,
  openLdapIsExpanded: false,

  isShibboleth:             equal('providerName', 'shibboleth'),
  shibbolethOpenLdapConfig: alias('authConfig.openLdapConfig'),

  actions: {
    openLdapExpanded(expandFn, item) {
      const { openLdapIsExpanded, authConfig } = this;

      // Intentionally not reset, only needs to indicate it was opened once
      if (!openLdapIsExpanded && isEmpty(authConfig.openLdapConfig)) {
        set(this, 'openLdapIsExpanded', true);
        set(this, 'authConfig.openLdapConfig', this.globalStore.createRecord({ type: 'ldapFields' }));
      }

      expandFn(item);
    },
  },

  tlsChanged: observer('shibbolethOpenLdapConfig.tls', function() {
    const authConfig = get(this, 'shibbolethOpenLdapConfig');
    const on         = (get(authConfig, 'tls') || false);
    const port       = parseInt(get(authConfig, 'port'), 10);

    if ( on && port === PLAIN_PORT ) {
      set(this, 'shibbolethOpenLdapConfig.port', TLS_PORT);
    } else if ( !on && port === TLS_PORT ) {
      setProperties(authConfig, {
        port: PLAIN_PORT,
        tls:  false
      });
    }
  }),

  configServers: computed('shibbolethOpenLdapConfig.servers', {
    get() {
      return (get(this, 'shibbolethOpenLdapConfig.servers') || []).join(',');
    },
    set(key, value) {
      set(this, 'shibbolethOpenLdapConfig.servers', value.split(','));

      return value;
    }
  }),
});
