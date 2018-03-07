import { inject as service } from '@ember/service';
import { get } from '@ember/object'
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  model: function() {
    let globalStore = this.get('globalStore');
    const cluster = window.l('route:application').modelFor('authenticated.cluster')
    const cluster_id = cluster.id;
    if ( get(cluster,'state') !== 'active' ) {
      this.transitionToExternal('authenticated.cluster.index');
    }

    let clusterPipeline = globalStore.find('clusterPipeline',`${cluster_id}:${cluster_id}`,{forceReload: true});
    return hash({
      clusterPipeline,
      globalGithubConfig: globalStore.find('authconfig', 'github'),
    })
  }
});
