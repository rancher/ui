import Service from '@ember/service';
import { inject as service } from '@ember/service';


export default Service.extend({
  globalStore: service(),
  scope: service(),
  deploy: false,
  isReady() {
    let clusterId = this.get('scope').currentCluster.id;
    this.get('globalStore').find('clusterPipeline', `${clusterId}:${clusterId}`)
      .then((res)=>{
        this.set('deploy', res.deploy);
      })
  },
});
