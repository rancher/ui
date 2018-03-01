import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

var Ingress = Resource.extend({
  type: 'ingress',

  clusterStore: service(),
  router: service(),
  namespace: reference('namespaceId', 'namespace', 'clusterStore'),

  actions: {
    edit: function () {
      get(this,'router').transitionTo('ingresses.run', {queryParams: {
        ingressId: get(this, 'id'),
        upgrade: true,
      }});
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
