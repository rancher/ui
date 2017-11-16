import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  clusterStore: service('cluster-store'),
  scope: service(),
  activate() {
    this._super();
    this.get('scope').setPageScope('cluster');
  },

  model(params/*,transition*/) {
    return this.get('clusterStore').find('cluster', params.cluster_id);
  },
});
