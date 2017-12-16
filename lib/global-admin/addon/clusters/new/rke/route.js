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
    let { cluster, hostTemplates, machineDrivers, hosts, roleTemplates: roles, policies } = models;

    set(cluster, 'rancherKubernetesEngineConfig', config);

    return {
      cluster,
      hostTemplates,
      machineDrivers,
      hosts,
      roles,
      policies,
    };
  }
});
