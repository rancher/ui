import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    let store = this.get('globalStore');
    return hash({
      hosts: store.findAll('machine'), // this should eventually be all host with out cluster id
      hostTemplates: store.findAll('machinetemplate'),
      machineDrivers: store.findAll('machinedriver'),
    }).then((hash) => {
      return EmberObject.create({
        hosts: hash.hosts,
        hostTemplates: hash.hostTemplates,
        machineDrivers: hash.machineDrivers,
      });
    });
  },
});
