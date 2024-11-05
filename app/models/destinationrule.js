import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  canHaveLabels:        true,
  namespace:            reference('namespaceId', 'namespace', 'clusterStore'),

  displaySubsetsString: computed('displaySubsets.[]', function() {
    return (this.displaySubsets || []).join(', ');
  }),

  displaySubsets: computed('subsets.[]', function() {
    return (this.subsets || []).map((s) => s.name);
  }),

  actions:      {
    edit() {
      this.router.transitionTo('authenticated.project.istio.destination-rule.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.istio.destination-rule.new', this.projectId, { queryParams: { id: this.id } });
    },
  },

});
