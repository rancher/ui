import Service from '@ember/service';
import { inject as service } from '@ember/service';


export default Service.extend({
  globalStore: service(),
  scope: service(),
  deploy: false,
  isReady(clusterId) {
    let requestClusterId = clusterId||this.get('scope').currentCluster.id;
    this.set('deploy', false);
    return this.get('globalStore').find('clusterPipeline', `${requestClusterId}:${requestClusterId}`)
      .then((res)=>{
        this.set('deploy', res.deploy);
        return res.deploy;
      }).catch(()=>{
        this.set('deploy', false);
        return false;
      })
  },
});
