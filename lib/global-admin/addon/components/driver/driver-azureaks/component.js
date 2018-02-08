import Component from '@ember/component'
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import ACC from 'shared/mixins/alert-child-component';
import {
  sizes,
  neuRegions,
} from 'ui/utils/azure-choices';
import layout from './template';

const M_CONFIG = {
  type: 'clusterRoleTemplateBinding',
  clusterId: '',
  name: '',
  subjectKind: '',
  userId: '',
  roleTemplateId: '',
};

const VERSIONS = [
  // {
  //   "value": "1.7.7"
  // },
  {
    "value": "1.8.1"
  },
];

export default Component.extend(ACC, {
  layout,
  router:          service(),
  globalStore:     service(),
  memberConfig:    M_CONFIG,

  primaryResource: alias('cluster'),
  config:          alias('cluster.azureKubernetesServiceConfig'),

  cluster:         null,
  errors:          null,
  editing:         false,

  zones:           neuRegions,
  versions:        VERSIONS,
  machineSizes:    sizes,

  init() {
    this._super(...arguments);

    window.gke = this;

    let config = get(this, 'cluster.azureKubernetesServiceConfig');
    if ( !config ) {
      config = this.get('globalStore').createRecord({
        agentPoolName: "rancher",
        type: 'azureKubernetesServiceConfig',
        osDiskSizeGb: 100,
        adminUsername: 'azureuser',
        kubernetesVersion: '1.8.1',
        nodeCount: 3,
        agentVmSize: 'Standard_A2',
        location: 'eastus',
      });

      set(this, 'cluster.azureKubernetesServiceConfig', config);
    }
  },

  actions: {
  },

  didSave() {
    const pr = get(this, 'primaryResource');
    return pr.waitForCondition('BackingNamespaceCreated').then(() => {
      return this.alertChildDidSave().then(() => {
        return pr;
      });
    });
  },

  doneSaving() {
    this.get('router').transitionTo('global-admin.clusters.index');
  },
});
