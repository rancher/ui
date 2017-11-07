import ActiveDirectory from './activedirectory';
import C from 'shared/utils/constants';

export default ActiveDirectory.extend({
  providerName: 'ldap.providerName.openldap',
  isOpenLdap: true,
  userType: C.PROJECT.TYPE_OPENLDAP_USER,
  groupType: C.PROJECT.TYPE_OPENLDAP_GROUP,
});
