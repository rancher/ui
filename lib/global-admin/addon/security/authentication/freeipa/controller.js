import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import Errors from 'ui/utils/errors';
import C from 'ui/utils/constants';
import { alias } from '@ember/object/computed';
import { get, set, computed, observer } from '@ember/object';

export default Controller.extend({
  settings:     service(),
  isEnabled:    true,
  errors:         null,
  providerName: 'authPage.freeipa.providerName',
  userType:       C.PROJECT.TYPE_LDAP_USER,
  groupType:      C.PROJECT.TYPE_LDAP_GROUP,
  // isEnabled:      alias('model.freeIpa.enabled'),
  // freeipaConfig:       alias('model.freeIpa'),
  freeipaConfig:       {},
  editing:        false,


  numUsers: computed('freeipaConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return 2;
    // return ( get(this, 'freeipaConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_FREEIPA_USER)).get('length');
  }),

  numGroups: computed('freeipaConfig.allowedPrincipalIds.[]','userType','groupType', function() {
    return 2;
    // return ( get(this, 'freeipaConfig.allowedPrincipalIds') || [] ).filter(principal => principal.includes(C.PROJECT.TYPE_FREEIPA_GROUP)).get('length');
  }),

});
