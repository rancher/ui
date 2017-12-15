import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';


export default Ember.Route.extend({
  clusterStore: service(),
  globalStore: service(),
  model: function(/* params, transition */) {
    let clusterStore = get(this, 'clusterStore');
    let def = {
      type: 'rancherKubernetesEngineConfig',
      hosts: [],
      network: {
        options: [],
        plugin:'flannel',
      },
      auth: {
        options: [],
        strategy: 'x509',
      }
    };
    let config = clusterStore.createRecord(def);
    let models = this.modelFor('clusters.new');
    let cluster = get(models, 'cluster')
    let hostTemplates = get(models, 'hostTemplates');
    let machineDrivers = get(models, 'machineDrivers');
    let hosts = get(models, 'hosts');
    let roles = get(models, 'roleTemplates');

    set(cluster, 'rancherKubernetesEngineConfig', config);

    return {
      cluster,
      hostTemplates,
      machineDrivers,
      hosts,
      roles
    };
  }
});
