import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  settings:    service(),

  model() {
    const store = this.get('globalStore');
    const hideLocalCluster = get(this.settings, 'shouldHideLocalCluster');

    return store.findAll('cluster').then((/* resp */) => {
      const clusters = store.all('cluster').filter((cluster) => {
        if ((hideLocalCluster && get(cluster, 'id') !== 'local') || !hideLocalCluster) {
          return cluster;
        }
      });

      if (clusters.length > 0) {
        clusters.forEach((cluster) => {
          cluster.store.findAll('etcdbackup');
        });
      }

      return { clusters };
    });
  },
});
