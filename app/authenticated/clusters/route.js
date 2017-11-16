import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  scope: service(),

  activate() {
    this._super();
    this.get('scope').setPageScope('clusters');
  },

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
