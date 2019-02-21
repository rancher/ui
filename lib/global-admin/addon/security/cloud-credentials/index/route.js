import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
// import { get } from '@ember/object';

export default Route.extend({
  globalStore:         service(),

  model(/* params */) {
    return this.globalStore.findAll('cloudcredential');
  },
});
