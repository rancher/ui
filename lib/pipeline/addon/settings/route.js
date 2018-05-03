import { inject as service } from '@ember/service';
import { get } from '@ember/object'
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

let decomposeRedirectUrl = (url)=>{
  return {
    clientId: url.split('?')[1].split('=')[1]
  }
}
export default Route.extend({
  globalStore: service(),
  access: service(),
  model: function() {
    let globalStore = get(this, 'globalStore');
    const cluster = window.l('route:application').modelFor('authenticated.cluster')
    const cluster_id = cluster.id;
    if ( get(cluster,'state') !== 'active' ) {
      this.transitionToExternal('authenticated.cluster.index');
    }

    let loginConfigs = globalStore.request({url: '/v3-public/authProviders'});

    let clusterPipeline = globalStore.find('clusterPipeline',`${cluster_id}:${cluster_id}`,{forceReload: true});
    return hash({
      clusterPipeline,
      loginConfigs
    }).then(({clusterPipeline,loginConfigs})=>{
      let decomposedGlobalGithubConfig = loginConfigs.findBy('id', 'github');
      if(decomposedGlobalGithubConfig){
        let desomposed = decomposeRedirectUrl(decomposedGlobalGithubConfig.redirectUrl);
        decomposedGlobalGithubConfig.enabled = true;
        decomposedGlobalGithubConfig.clientId = desomposed.clientId;
      }
      return {
        clusterPipeline,
        globalGithubConfig: decomposedGlobalGithubConfig
      }
    })
  }
});
