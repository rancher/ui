import { inject as service } from '@ember/service';
import { get } from '@ember/object'
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  model: function() {
    let globalStore = this.get('globalStore');
    const cluster = window.l('route:application').modelFor('authenticated.cluster')
    const cluster_id = cluster.id;
    if ( get(cluster,'state') !== 'active' ) {
      this.transitionTo('authenticated.cluster.index');
    }

    let model = globalStore.find('clusterPipeline',`${cluster_id}:${cluster_id}`,{forceReload: true});
    // return model
    return model
  }
});
