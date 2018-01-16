import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { hash } from 'rsvp';


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

    return hash({
      users: get(this, 'globalStore').findAll('user'),
      user: get(this, 'globalStore').find('user', null, {forceReload: true, filter: {me:true}}),
      clusterRoleTemplateBinding: get(this, 'globalStore').findAll('clusterRoleTemplateBinding', { forceReload: true }),
    }).then((hash) => {
        return {
          cluster,
          clusterRoleTemplateBinding: hash.clusterRoleTemplateBinding,
          machineTemplates,
          machineDrivers,
          nodes,
          roles,
          policies,
          users: hash.users,
          me: hash.user.get('firstObject'),
        };
      });
  }
});
