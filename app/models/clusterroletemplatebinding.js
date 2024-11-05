import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { get, computed } from '@ember/object';
import C from 'ui/utils/constants';
import PrincipalReference from 'ui/mixins/principal-reference';


export default Resource.extend(PrincipalReference, {
  type: 'clusterRoleTemplateBinding',

  canEdit:      false,
  cluster:      reference('clusterId'),
  roleTemplate: reference('roleTemplateId'),
  user:         reference('userId', 'user'),
  isCustom:     computed('roleTemplateId', function() {
    return !C.BASIC_ROLE_TEMPLATE_ROLES.includes(this.roleTemplateId);
  }),

  principalId: computed('userPrincipalId', 'groupPrincipalId', function() {
    return this.groupPrincipalId || this.userPrincipalId || null;
  }),

  canRemove: computed('links.remove', 'name', function() {
    return !!get(this, 'links.remove') && this.name !== 'creator';
  }),

});
