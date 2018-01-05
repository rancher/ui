import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';

var Ingress = Resource.extend({
  type: 'ingress',

  namespace: reference('namespaceId'),

  actions: {
    edit: function () {
    },
  },

  availableActions: computed('links.{update,remove}', function () {
    let l = get(this, 'links');

    return [
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: !!l.update },
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];
  }),

});

export default Ingress;
