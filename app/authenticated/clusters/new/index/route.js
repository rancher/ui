import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

// @@TODO@@ - 11-28-17 - just temp until endpoints
import Mocks from './mocks';
import Schemas from './schemas';

export default Route.extend({
  clusterStore: service('cluster-store'),
  catalog: service(),
  settings: service(),

  model() {
    // TODO - !!FORDEV!! removed for dev sake
    let store = this.get('clusterStore');

    store._bulkAdd('schema', Schemas);
    Object.keys(Mocks).forEach((mock) => {
      var toAdd = Mocks[mock];
      store._typeify(toAdd.data, {updateStore: true});
    })
    let def = JSON.parse(this.get(`settings.${C.SETTING.CLUSTER_TEMPLATE}`)) || {};
    def.type = 'cluster';

    let cluster = store.createRecord(def);

    return EmberObject.create({
      cluster: cluster,
      hosts: store.all('host'), // this should eventually be all host with out cluster id
      hostTemplates: store.all('hosttemplate'),
      machineDrivers: store.all('machinedriver'),
    });
  },
});
