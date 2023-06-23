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
  hasLabels:                       false,
  taints:                          {},
  hasTaints:                       false,

  isSystemType: equal('nodePool.mode', 'System'),

  init() {
    this._super(...arguments);

    const taints = get(this, 'nodePool.nodeTaints');

    if (taints) {
      let _taints = taints.map((t = '') => {
        const splitEffect = t.split(':');
        const splitLabel = (splitEffect[0] || '').split('=');

        return {
          effect: splitEffect[1],
          key:    splitLabel[0],
          value:  splitLabel[1],
        };
      })

      this.taints = { nodeTaints: _taints };
      set(this, 'hasTaints', _taints.length > 0);
    } else {
      this.taints = { nodeTaints: [] };
    }

    const labels = get(this, 'nodePool.nodeLabels');

    set(this, 'hasLabels', Object.keys(labels || {}).length > 0);

    // Ensure maxSurge is set - it may not be for an existing cluster created before the UI was updated to support maxSurge
    const maxSurge = get(this, 'nodePool.maxSurge');

    if (!maxSurge) {
      set(this, 'nodePool.maxSurge', 1);
    }
  },

  actions: {
    setNodeLabels(labels) {
      let out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'nodePool.nodeLabels', out);
    },

    setTaints(taints) {
      if (taints.length > 0) {
        set(this, 'nodePool.nodeTaints', taints.map((t) => {
          return `${ t.key }=${ t.value }:${ t.effect }`;
        }));
      } else {
        delete this.nodePool.nodeTaints
      }
    }
  },

  resetAutoScaling: observer('nodePool.enableAutoScaling', function() {
    const { nodePool } = this;

    if (!nodePool?.enableAutoScaling) {
      if (nodePool?.minCount) {
        delete nodePool.minCount;
      }
      if (nodePool?.maxCount) {
        delete nodePool.maxCount;
      }
    }
  }),

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

  // First pool is always the primary pool
  // Node pools is an array and first one can not be removed
  primaryPool: computed('cluster.aksConfig.nodePools.[]', 'cluster.aksConfig', 'nodePool', function() {
    const { nodePools } = this.cluster?.aksConfig;

    const index = nodePools.findIndex((pool) => pool === this.nodePool);

    // First pool is always the primary pool
    return index === 0;
  }),

  shouldDisableNodeCount: computed('nodePool.enableAutoScaling', 'isNewNodePool', function() {
    const { nodePool } = this;

    if (nodePool?.enableAutoScaling) {
      return true;
    }

    return false;
  }),

});
