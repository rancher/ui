import Ember from 'ember';
import ActiveDirectory from 'ui/admin-tab/auth/activedirectory/controller';

import C from 'ui/utils/constants';

export default ActiveDirectory.extend({
  providerName: 'ldap.providerName.openldap',
  isOpenLdap:   true,
  userType:     C.PROJECT.TYPE_OPENLDAP_USER,
  groupType:    C.PROJECT.TYPE_OPENLDAP_GROUP,
  ldapConfig:   Ember.computed.alias('model'),
});
