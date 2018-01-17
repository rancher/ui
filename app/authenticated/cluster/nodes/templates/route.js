import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model() {
    let globalStore = get(this, 'globalStore');
    return hash({
      machineTemplates: globalStore.findAll('machinetemplate'),
      machineDrivers: globalStore.find('machinedriver', null, {filter: {active: true}}),
    }).then((hash) => {
      return EmberObject.create({
        machineTemplates: hash.machineTemplates,
        machineDrivers: hash.machineDrivers,
      });
    });
  },
});
