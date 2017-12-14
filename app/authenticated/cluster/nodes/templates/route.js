import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get } from '@ember/object';

export default Route.extend({
  clusterStore: service(),
  globalStore: service(),

  model() {
    let store = get(this, 'clusterStore');
    let globalStore = get(this, 'globalStore');
    return hash({
      hosts: store.findAll('node'), // this should eventually be all host with out cluster id
      hostTemplates: globalStore.findAll('machinetemplate'),
      machineDrivers: globalStore.findAll('machinedriver'),
    }).then((hash) => {
      return EmberObject.create({
        hosts: hash.hosts,
        hostTemplates: hash.hostTemplates,
        machineDrivers: hash.machineDrivers,
      });
    });
  },
});
