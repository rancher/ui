import Component from '@ember/component'
import { alias } from '@ember/object/computed';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import ACC from 'shared/mixins/alert-child-component';
import {
  sizes,
  neuRegions,
} from 'ui/utils/azure-choices';

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
  router:     service(),
  globalStore: service(),
  memberConfig:    M_CONFIG,

  primaryResource: alias('cluster'),
  config: alias('cluster.azureKubernetesEngineConfig'),

  cluster: null,
  errors: null,

  zones: neuRegions,
  versions: VERSIONS,
  machineSizes: sizes,

  init() {
    this._super(...arguments);

    window.gke = this;

    let config = get(this, 'cluster.azureKubernetesEngineConfig');
    if ( !config ) {
      config = this.get('globalStore').createRecord({
        type: 'azureKubernetesEngineConfig',
        osDiskSizeGb: 100,
        adminUsername: 'azureuser',
        kubernetesVersion: '1.8.1',
        nodeCount: 3,
        agentVmSize: 'Standard_A2',
        location: 'eastus',
      });

      set(this, 'cluster.azureKubernetesEngineConfig', config);
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
