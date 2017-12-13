import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  clusterStore: service(),
  scope: service(),

  model: function() {
    return this.get('clusterStore').find('node').then((nodes) => {
      const cluster = this.get('scope').currentCluster;
      return {
        displayName: cluster.name,
        nodes,
        cluster,
      };
    });
  },
});
