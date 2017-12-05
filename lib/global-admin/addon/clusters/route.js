import Route from '@ember/routing/route';
import { inject as service } from "@ember/service";

export default Route.extend({
  globalStore: service(),

  model() {
    const store = this.get('globalStore');
    return store.find('cluster', null, {url: 'clusters', forceReload: true, removeMissing: true}).then(() => {
      //return a live array so its updated
      return {
        clusters: store.all('cluster'),
      };
    });
  },
});
