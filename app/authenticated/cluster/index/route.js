import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),
  scope: service(),

  model: function () {
    return this.get('globalStore').findAll('machine', { filter: { clusterId: this.get('scope.currentCluster.id') } }).then((nodes) => {
      const cluster = this.get('scope').currentCluster;
      return {
        displayName: cluster.name,
        nodes,
      };
    });
  },
});
