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
      authentication: {
        options: [],
        strategy: 'x509',
      }
    };
    let config = clusterStore.createRecord(def);
    let models = this.modelFor('clusters.new');
    let { cluster, machineTemplates, machineDrivers, hosts: nodes, roleTemplates: roles, policies } = models;

    set(cluster, 'rancherKubernetesEngineConfig', config);

    return get(this, 'globalStore').find('user', null, {forceReload: true}).then((users) => {
      // TODO - 2.0
      // return get(this, 'globalStore').find('user', null, {filter: {me: true}}).then((user) => {
      return get(this, 'globalStore').find('user', 'admin', {forceReload: true}).then((user) => {
        return {
          cluster,
          machineTemplates,
          machineDrivers,
          nodes,
          roles,
          policies,
          users,
          me: user,
        };
      })
    });
  }
});
