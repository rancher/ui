import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';


export default Ember.Route.extend({
  clusterStore: service('cluster-store'),
  model: function(/* params, transition */) {
    let clusterStore = get(this, 'clusterStore');
    let def = {
      type: 'rancherKubernetesEngineConfig',
      hosts: [],
      network: 'flannel',
      auth: 'x509'
    };
    let config = clusterStore.createRecord(def);
    let models = this.modelFor('clusters.new');
    let cluster = get(models, 'cluster')
    let hostTemplates = get(models, 'hostTemplates');
    let machineDrivers = get(models, 'machineDrivers');
    let hosts = get(models, 'hosts');

    set(cluster, 'rancherKubernetesEngineConfig', config);

    return {
      cluster: cluster,
      hostTemplates: hostTemplates,
      machineDrivers: machineDrivers,
      hosts: hosts
    };
  }
});
