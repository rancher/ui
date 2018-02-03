import Ember from 'ember';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { hash } from 'rsvp';


export default Ember.Route.extend({
  globalStore: service(),
  model: function(/* params, transition */) {
    let globalStore = get(this, 'globalStore');

    let def = {
      type: 'rancherKubernetesEngineConfig',
      hosts: [],
      network: {
        options: [],
        plugin:'flannel',
      },
      ignoreDockerVersion: true,
      services: {
        kubeApi: {
          serviceClusterIpRange: '10.233.0.0/18',
          podSecurityPolicy: false,
          extraArgs: {
            v: '4',
          }
        },
        kubeController: {
          clusterCidr: '10.233.64.0/18',
          serviceClusterIpRange: '10.233.0.0/18',
        },
        kubelet: {
          clusterDnsServer: '10.233.0.3',
          clusterDomain: 'cluster.local',
          infraContainerImage: 'gcr.io/google_containers/pause-amd64:3.0',
        },
      },
      authentication: {
        options: [],
        strategy: 'x509',
      }
    };
    let config = globalStore.createRecord(def);
    let models = this.modelFor('clusters.new');
    let { cluster, machineTemplates, machineDrivers, hosts: nodes, roleTemplates: roles, policies } = models;

    set(cluster, 'rancherKubernetesEngineConfig', config);
    set(cluster, 'googleKubernetesEngineConfig', null);

    return hash({
      users: globalStore.findAll('user'),
      user: globalStore.find('user', null, {forceReload: true, filter: {me:true}}),
      clusterRoleTemplateBinding: globalStore.findAll('clusterRoleTemplateBinding', { forceReload: true }),
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
  },

  resetController: function (controller, isExisting) {
    if (isExisting)
    {
      controller.set('errors', []);
    }
  },
});
