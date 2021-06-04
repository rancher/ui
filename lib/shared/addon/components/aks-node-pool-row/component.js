import Component from '@ember/component';
import { computed, get, observer, set } from '@ember/object';
import { equal } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { isEmpty } from '@ember/utils';
import Semver from 'semver';
import layout from './template';

const OS_TYPES = [
  { value: 'Linux', },
  { value: 'Windows', }
];

const OS_DISK_TYPES = [
  { value: 'Ephemeral' },
  { value: 'Managed' }
]

export default Component.extend({
  layout,

  cluster:                         null,
  nodePool:                        null,
  vmSizes:                         null,
  vmOs:                            OS_TYPES,
  diskTypes:                       OS_DISK_TYPES,
  upgradeVersion:                  false,
  showNodeUpgradePreventionReason: false,
  disableAzs:                      false,

  isSystemType: equal('nodePool.mode', 'System'),

  updateNodeVersion: on('init', observer('cluster.aksConfig.kubernetesVersion', 'upgradeVersion', 'upgradeAvailable', 'isNewNodePool', function() {
    const {
      cluster, upgradeAvailable, nodePool, upgradeVersion, isNewNodePool
    } = this;

    if (upgradeAvailable && upgradeVersion || isNewNodePool) {
      set(nodePool, 'orchestratorVersion', cluster.aksConfig.kubernetesVersion);
    }
  })),

  resetAvailablity: on('init', observer('isNewNodePool', 'disableAzs', function() {
    const {
      isNewNodePool, disableAzs, nodePool: { availabilityZones }, mode
    } = this;

    if (mode !== 'edit' && !isNewNodePool || disableAzs) {
      if (!isEmpty(availabilityZones)) {
        set(this, 'nodePool.availabilityZones', []);
      }
    }
  })),

  availablityZoneOne: computed('nodePool.availabilityZones.[]', {
    get() {
      return (this.nodePool?.availabilityZones ?? []).find((az) => az === '1') ? true : false;
    },
    set(_key, value) {
      let azs = (this.nodePool?.availabilityZones ?? []).slice();

      if (value) {
        if (!azs.find((az) => az === '1')) {
          azs.push('1');
        }
      } else {
        azs = azs.without('1');
      }

      set(this, 'nodePool.availabilityZones', azs.sort());

      return value;
    }
  }),

  availablityZoneThree: computed('nodePool.availabilityZones.[]', {
    get() {
      return (this.nodePool?.availabilityZones ?? []).find((az) => az === '2') ? true : false;
    },
    set(_key, value) {
      let azs = (this.nodePool?.availabilityZones ?? []).slice();

      if (value) {
        if (!azs.find((az) => az === '2')) {
          azs.push('2');
        }
      } else {
        azs = azs.without('2');
      }

      set(this, 'nodePool.availabilityZones', azs.sort());

      return value;
    }
  }),

  availablityZoneTwo: computed('nodePool.availabilityZones.[]', {
    get() {
      return (this.nodePool?.availabilityZones ?? []).find((az) => az === '3') ? true : false;
    },
    set(_key, value) {
      let azs = (this.nodePool?.availabilityZones ?? []).slice();

      if (value) {
        if (!azs.find((az) => az === '3')) {
          azs.push('3');
        }
      } else {
        azs = azs.without('3');
      }

      set(this, 'nodePool.availabilityZones', azs.sort());

      return value;
    }
  }),

  originalClusterVersion: computed('cluster.aksConfig.kubernetesVersion', 'originalCluster.aksConfig.kubernetesVersion', 'originalCluster.aksConfig.upstreamSpec.kubernetesVersion', function() {
    if (!isEmpty(get(this, 'originalCluster.aksConfig.kubernetesVersion'))) {
      return get(this, 'originalCluster.aksConfig.kubernetesVersion');
    }

    if (!isEmpty(get(this, 'originalCluster.aksConfig.upstreamSpec.kubernetesVersion'))) {
      return get(this, 'originalCluster.aksConfig.upstreamSpec.kubernetesVersion');
    }

    return '';
  }),

  upgradeAvailable: computed('cluster.aksConfig.kubernetesVersion', 'isNewNodePool', 'mode', 'model.version', 'nodePool.orchestratorVersion', 'originalClusterVersion', 'showNodeUpgradePreventionReason', function() {
    const originalClusterVersion = get(this, 'originalClusterVersion');
    const clusterVersion        = get(this, 'cluster.aksConfig.kubernetesVersion');
    let   nodeVersion           = get(this, 'nodePool.orchestratorVersion');
    const mode                  = get(this, 'mode');
    const isNewNodePool         = get(this, 'isNewNodePool');

    if (isNewNodePool && isEmpty(nodeVersion)) {
      set(this, 'nodePool.orchestratorVersion', clusterVersion);

      // nodeVersion = clusterVersion;
      return false;
    }

    const initalClusterMinorVersion = parseInt(Semver.minor(Semver.coerce(clusterVersion)), 10);
    const initalNodeMinorVersion   = parseInt(Semver.minor(Semver.coerce(nodeVersion)), 10);
    const diff                     = initalClusterMinorVersion - initalNodeMinorVersion;

    if (mode === 'edit') {
      // we must upgrade the cluster first
      if (originalClusterVersion !== clusterVersion) {
        set(this, 'showNodeUpgradePreventionReason', true);

        return false;
      }
    }

    if (diff === 0 && get(this, 'showNodeUpgradePreventionReason')) {
      set(this, 'showNodeUpgradePreventionReason', false);
    }

    // return diff === 1;
    if (isEmpty(clusterVersion) || isEmpty(nodeVersion)) {
      return false;
    }

    const nodeIsLess = Semver.lt(nodeVersion, clusterVersion, { includePrerelease: true });

    if (nodeIsLess) {
      return true;
    }

    return false;
  }),

  machineSizes: computed('vmSizes.[]', function() {
    return ( this?.vmSizes || [] ).map((vm) => {
      return { value: vm };
    });
  }),

  isNewNodePool: computed('nodePool.isNew', function() {
    return this?.nodePool?.isNew ?? false;
  }),

  displayZones: computed('nodePool.availabilityZones.[]', function() {
    return (this?.nodePool?.availabilityZones || []).slice().join(', ');
  }),

  primaryPool: computed('cluster.aksConfig.nodePools.[]', 'cluster.aksConfig.nodePools.@each.mode', 'isSystemType', function() {
    const { nodePools } = this.cluster?.aksConfig;

    if (nodePools.length === 1) {
      return true;
    }

    if (nodePools.length > 1) {
      const systemPools = nodePools.filterBy('mode', 'System');

      if (systemPools.length === 1 && this.isSystemType) {
        return true;
      } else if (systemPools.length > 1) {
        return false;
      }
    }

    return false;
  }),

});
