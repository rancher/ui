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

  isSystemType: equal('nodePool.mode', 'System'),

  updateNodeVersion: on('init', observer('cluster.aksConfig.kubernetesVersion', 'upgradeVersion', 'upgradeAvailable', function() {
    const {
      cluster, upgradeAvailable, nodePool, upgradeVersion
    } = this;

    if (upgradeAvailable && upgradeVersion) {
      set(nodePool, 'orchestratorVersion', cluster.aksConfig.kubernetesVersion);
    }
  })),

  originalClusterVersion: computed('cluster.aksConfig.kubernetesVersion', 'originalCluster.aksConfig.kubernetesVersion', 'originalCluster.aksConfig.upstreamSpec.kubernetesVersion', function() {
    if (!isEmpty(get(this, 'originalCluster.aksConfig.kubernetesVersion'))) {
      return get(this, 'originalCluster.aksConfig.kubernetesVersion');
    }

    if (!isEmpty(get(this, 'originalCluster.aksConfig.upstreamSpec.kubernetesVersion'))) {
      return get(this, 'originalCluster.aksConfig.upstreamSpec.kubernetesVersion');
    }

    return '';
  }),

  upgradeAvailable: computed('cluster.aksConfig.kubernetesVersion', 'mode', 'model.version', 'nodePool.orchestratorVersion', 'originalClusterVersion', 'showNodeUpgradePreventionReason', function() {
    const originalClusterVersion = get(this, 'originalClusterVersion');
    const clusterVersion         = get(this, 'cluster.aksConfig.kubernetesVersion');
    const nodeVersion            = get(this, 'nodePool.orchestratorVersion');
    const mode                   = get(this, 'mode');

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
