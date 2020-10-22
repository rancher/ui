import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    const store = this.get('globalStore');

    return store.findAll('cluster').then((/* resp */) => {
      const clusters = store.all('cluster');

      if (clusters.length > 0) {
        clusters.forEach((cluster) => {
          cluster.store.findAll('etcdbackup');
        });
      }

      return { clusters };
    });
  },
});
