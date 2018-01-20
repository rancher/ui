import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { get, computed } from '@ember/object';

export default Resource.extend({
  type:    'clusterRoleTemplateBinding',

  cluster: reference('clusterId'),
  roleTemplate: reference('roleTemplateId'),
  user: reference('subjectName', 'user'),

  displayName: computed('name','id', function() {
    let name = get(this, 'name');
    if ( name ) {
      return name;
    }

    return '(' + get(this,'id') + ')';
  }),

  availableActions: computed('links.remove', 'name', function() {
    const l = get(this, 'links');
    const canRemove = !!l.remove && get(this,'name') !== 'creator';

    return [
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: canRemove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }),
});
