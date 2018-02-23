import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  model: function() {
    let globalStore = this.get('globalStore');
    const cluster_id = window.l('route:application').modelFor('authenticated.cluster').id;
    let model = globalStore.find('clusterPipeline',`${cluster_id}:${cluster_id}`,{forceReload: true});
    // return model
    return model
  }
});
