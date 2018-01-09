import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    let store = this.get('globalStore');
    return hash({
      availableDrivers: store.find('machinedriver', null, {filter: {active: true}}),
      clusters: store.findAll('cluster'),
    })
  },

  setupController(controller, model) {
    this._super(...arguments);
    if ( !get(controller,'driver') ) {
      let drivers = get(model,'availableDrivers').sortBy('name'); // might be alphabetical but meh sort that stuff
      set(controller, 'driver', get(drivers, 'firstObject.name')||'custom');
    }
  }
});
