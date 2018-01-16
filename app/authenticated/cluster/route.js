import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Preload from 'ui/mixins/preload';

export default Route.extend(Preload, {
  scope: service(),

  activate() {
    this._super();
    this.get('scope').setPageScope('cluster');
  },

  model(params) {
    return get(this, 'globalStore').find('cluster', params.cluster_id).then((cluster) => {
      get(this, 'scope').setCurrentCluster(cluster);
      return this.loadSchemas('clusterStore').then(() => {
        return cluster;
      });
    });
  },

});
