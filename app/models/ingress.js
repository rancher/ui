import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export default Resource.extend({
  type: 'ingress',

  canClone: false,
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
});
