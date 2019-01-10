import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { get, computed } from '@ember/object';
import C from 'ui/utils/constants';
import PrincipalReference from 'ui/mixins/principal-reference';

export default Resource.extend(PrincipalReference, {
  type:         'projectRoleTemplateBinding',
  canEdit:      false,
  project:      reference('projectId'),
  roleTemplate: reference('roleTemplateId'),
  user:         reference('userId', 'user'),
  displayName:  computed('name', 'id', function() {
    let name = get(this, 'name');

    if ( name ) {
      return name;
    }

    return `(${  get(this, 'id')  })`;
  }),
  isCustom: computed('roleTemplateId', function() {
    return !C.BASIC_ROLE_TEMPLATE_ROLES.includes(get(this, 'roleTemplateId'));
  }),

  principalId: computed('userPrincipalId', 'groupPrincipalId', function() {
    return get(this, 'groupPrincipalId') || get(this, 'userPrincipalId') || null;
  }),

  canRemove: computed('links.remove', 'name', function() {
    return !!get(this, 'links.remove') && get(this, 'name') !== 'creator';
  }),
});
