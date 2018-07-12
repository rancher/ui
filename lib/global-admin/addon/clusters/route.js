import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {

    const store = this.get('globalStore');

    return store.findAll('cluster').then(() => {

      return { clusters: store.all('cluster'), };

    });

  },
});
