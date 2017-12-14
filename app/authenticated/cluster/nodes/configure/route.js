import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),

  model() {
    let store = this.get('globalStore');
    return store.findAll('machinedriver').then( ( drivers ) => {
      return EmberObject.create({
        availableDrivers: drivers
      });
    });
  },
});
