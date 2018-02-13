import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    let store = this.get('globalStore');
    return hash({
      hosts: store.findAll('node'), // this should eventually be all host with out cluster id
      machineTemplates: store.findAll('nodeTemplate'),
      machineDrivers: store.find('nodeDriver', null, {filter: {active: true}}),
    }).then((hash) => {
      return EmberObject.create({
        hosts: hash.hosts,
        machineTemplates: hash.machineTemplates,
        machineDrivers: hash.machineDrivers,
      });
    });
  },
});
