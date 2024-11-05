import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Resource.extend({
  clusterStore:  service(),
  router:        service(),

  canHaveLabels:      true,
  namespace:          reference('namespaceId', 'namespace', 'clusterStore'),

  displayHostsString: computed('hosts.[]', function() {
    return (this.hosts || []).join(', ');
  }),

  actions:      {
    edit() {
      this.router.transitionTo('authenticated.project.istio.virtual-service.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.istio.virtual-service.new', this.projectId, { queryParams: { id: this.id } });
    },
  },

});
