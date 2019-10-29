import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model(/* params, transition */) {
    return this.globalStore.findAll('feature');
  }
});
