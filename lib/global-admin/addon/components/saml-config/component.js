import Component from '@ember/component';
import layout from './template';
import AuthMixin from 'global-admin/mixins/authentication';
import Saml from 'global-admin/mixins/saml-auth';
import { alias, equal } from '@ember/object/computed';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

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
