import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  scope: service(),

  activate() {
    this._super();
    this.get('scope').setPageScope('cluster');
  },

  model(params/*,transition*/) {
    return get(this, 'globalStore').find('cluster', params.cluster_id).then((cluster) => {
      get(this, 'scope').setCurrentCluster(cluster);
      return cluster;
    });
  },

});
