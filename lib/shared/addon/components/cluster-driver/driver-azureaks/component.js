import ClusterDriver from 'shared/mixins/cluster-driver';
import Component from '@ember/component'
import { get, set } from '@ember/object';
import layout from './template';

import {
  sizes,
  neuRegions,
} from 'ui/utils/azure-choices';

const VERSIONS = [
  {
    "value": "1.8.11"
  },
  {
    "value": "1.9.6"
  },
];

export default Component.extend(ClusterDriver, {
  layout,
  configField:  'azureKubernetesServiceConfig',

  zones:        neuRegions,
  versions:     VERSIONS,
  machineSizes: sizes,

  init() {
    this._super(...arguments);

    let config = get(this, 'cluster.azureKubernetesServiceConfig');

    if ( !config ) {

      config = this.get('globalStore').createRecord({
        agentPoolName:     "rancher",
        type:              'azureKubernetesServiceConfig',
        osDiskSizeGb:      100,
        adminUsername:     'azureuser',
        kubernetesVersion: '1.8.11',
        count:             3,
        agentVmSize:       'Standard_A2',
        location:          'eastus',
      });

      set(this, 'cluster.azureKubernetesServiceConfig', config);
    }
  },
});
