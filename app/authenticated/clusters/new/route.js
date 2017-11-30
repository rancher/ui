import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { hash/* , all */ } from 'rsvp';

export default Route.extend({
  clusterStore: service('cluster-store'),
  catalog: service(),
  settings: service(),

  model() {
    let store = this.get('clusterStore');

    let def = JSON.parse(this.get(`settings.${C.SETTING.CLUSTER_TEMPLATE}`)) || {};
    def.type = 'cluster';

    let cluster = store.createRecord(def);

    return hash({
      hosts: store.findAll('machine'), // this should eventually be all host with out cluster id
      hostTemplates: store.findAll('machinetemplate'),
      machineDrivers: store.findAll('machinedriver'),
    }).then((hash) => {
      return EmberObject.create({
        cluster: cluster,
        hosts: hash.hosts, // this should eventually be all host with out cluster id
        hostTemplates: hash.hostTemplates,
        machineDrivers: hash.machineDrivers,
      });
    });
  },
});
