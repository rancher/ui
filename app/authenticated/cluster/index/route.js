import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),
  scope: service(),

  model: function () {
    return this.get('globalStore').findAll('machine').then((nodes) => {
      const cluster = this.get('scope').currentCluster;

      return {
        displayName: cluster.name,
        nodes: nodes.filter(n => n.clusterId === cluster.id),
      };
    });
  },
});
