import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { get, computed } from '@ember/object';

export default Resource.extend({
  globalRole: reference('globalRoleId', 'globalRole'),

  availableActions: computed('links.remove', function() {
    let l = get(this, 'links');

    return [
//      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
//      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }),
});
