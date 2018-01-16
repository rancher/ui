import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';

const BASE = 'user-base';
const ADMIN = 'admin';
const SPECIAL = [BASE, ADMIN];

export default Resource.extend({

  isHidden: computed('id', function () {
    return SPECIAL.includes(get(this, 'id'));
  }),

  isBase: computed('id', function () {
    return get(this, 'id') === BASE;
  }),

  isAdmin: computed('id', function () {
    return get(this, 'id') === ADMIN;
  }),

  availableActions: computed('links.remove', function () {
    //    let l = get(this, 'links');

    return [
      //      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      //      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];
  }),
});
