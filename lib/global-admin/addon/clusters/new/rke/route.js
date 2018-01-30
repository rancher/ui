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
      services: {
        etcd: {
          image: 'quay.io/coreos/etcd:latest',
        },
        kubeApi: {
          image: 'rancher/k8s:v1.8.3-rancher2',
          serviceClusterIpRange: '10.233.0.0/18',
          podSecurityPolicy: false,
          extraArgs: {
            v: '4',
          }
        },
        kubeController: {
          image: 'rancher/k8s:v1.8.3-rancher2',
          clusterCidr: '10.233.64.0/18',
          serviceClusterIpRange: '10.233.0.0/18',
        },
        kubelet: {
          image: 'rancher/k8s:v1.8.3-rancher2',
          clusterDnsServer: '10.233.0.3',
          clusterDomain: 'cluster.local',
          infraContainerImage: 'gcr.io/google_containers/pause-amd64:3.0',
        },
        kubeproxy: {
          image: 'rancher/k8s:v1.8.3-rancher2',
        },
        scheduler: {
          image: 'rancher/k8s:v1.8.3-rancher2',
        },
      },
      systemImages: {
        alpine: 'alpine:latest',
        nginx_proxy: 'rancher/rke-nginx-proxy:v0.1.1',
        cert_downloader: 'rancher/rke-cert-deployer:v0.1.1',
        service_sidekick_image: 'rancher/rke-service-sidekick:v0.1.0',
        kubedns_image: 'gcr.io/google_containers/k8s-dns-kube-dns-amd64:1.14.5',
        dnsmasq_image: 'gcr.io/google_containers/k8s-dns-dnsmasq-nanny-amd64:1.14.5',
        kubedns_sidecar_image: 'gcr.io/google_containers/k8s-dns-sidecar-amd64:1.14.5',
        kubedns_autoscaler_image: 'gcr.io/google_containers/cluster-proportional-autoscaler-amd64:1.0.0',
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
