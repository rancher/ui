import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Service.extend({
  globalStore: service(),
  scope:       service(),
  deploy:      false,
  isReady(clusterId) {

    let requestClusterId = clusterId || get(this, 'scope').currentCluster.id;

    set(this, 'deploy', false);

    return get(this, 'globalStore').find('clusterPipeline', `${ requestClusterId }:${ requestClusterId }`)
      .then((res) => {

        set(this, 'deploy', res.deploy);

        return res.deploy;

      })
      .catch(() => {

        set(this, 'deploy', false);

        return false;

      })

  },
});
