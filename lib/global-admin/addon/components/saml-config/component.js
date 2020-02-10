import Component from '@ember/component';
import layout from './template';
import AuthMixin from 'global-admin/mixins/authentication';
import Saml from 'global-admin/mixins/saml-auth';
import { alias, equal } from '@ember/object/computed';
import { computed, get, set } from '@ember/object';

export default Component.extend(AuthMixin, Saml, {
  layout,

  advanced:         false,
  createLabel:      null,
  editLabel:        null,
  providerName:     null,
  providerNamePath: null,
  saveLabel:        null,

  isShibboleth:             equal('providerName', 'shibboleth'),
  shibbolethOpenLdapConfig: alias('authConfig.openLdapConfig'),

  configServers: computed('authConfig.servers', {
    get() {
      return (get(this, 'authConfig.servers') || []).join(',');
    },
    set(key, value) {
      set(this, 'authConfig.servers', value.split(','));

      return value;
    }
  }),
});
