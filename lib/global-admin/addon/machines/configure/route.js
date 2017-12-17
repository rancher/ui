import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
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

  setupController(controller, model) {
    this._super(...arguments);
    if ( !get(controller,'driver') ) {
      set(controller, 'driver', get(model,'availableDrivers.firstObject.name')||'custom');
    }
  }
});
