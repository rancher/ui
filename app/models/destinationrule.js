import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  canHaveLabels:        true,
  namespace:            reference('namespaceId', 'namespace', 'clusterStore'),

  displaySubsetsString: computed('displaySubsets.[]', function() {
    return (get(this, 'displaySubsets') || []).join(', ');
  }),

  displaySubsets: computed('subsets.[]', function() {
    return (get(this, 'subsets') || []).map((s) => s.name);
  }),

  actions:      {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.istio.project-istio.destination-rules.detail.edit', get(this, 'id'));
    },

    clone() {
      get(this, 'router').transitionTo('authenticated.project.istio.project-istio.destination-rules.new', get(this, 'projectId'), { queryParams: { id: get(this, 'id') } });
    },
  },

});
