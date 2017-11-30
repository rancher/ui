import Route from '@ember/routing/route';
import { inject as service } from "@ember/service";

export default Route.extend({
  clusterStore: service('cluster-store'),

  model() {
    var clusterStore = this.get('clusterStore');
    return clusterStore.find('cluster', null, {url: 'clusters', forceReload: true, removeMissing: true}).then(() => {
      //return a live array so its updated
      return {
        clusters: clusterStore.all('cluster'),
      };
    });
  },
});
