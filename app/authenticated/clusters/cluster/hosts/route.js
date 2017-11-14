import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  clsuterStore: service('cluster-store'),
  scope: service(),

  model: function() {
    return this.get('clusterStore').find('host', null, {filter: {clusterId: this.get('scope.currentCluster.id')}}).then((hosts) => {
      return {
        hosts: hosts,
      };
    });
  },
});
