import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { on } from '@ember/object/evented';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Semver from 'semver';
import { sortableNumericSuffix } from 'shared/utils/util';
import layout from './template';

export default Component.extend({
  google:          service(),
  serviceVersions: service('version-choices'),
  layout,

  cluster:                 null,
  originalCluster:         null,
  nodePool:                null,
  nodeAdvanced:            false,
  oauthScopesSelection:    null,
  scopeConfig:             null,
  diskTypeContent:         null,
  imageTypeContent:        null,
  machineTypes:            null,
  nodeVersions:            null,
  clusterVersion:          null,
  upgradeVersion:          false,
  originalPoolVersion:     null,

  init() {
    this._super(...arguments);

    const { nodePool } = this;

    setProperties(this, {
      scopeConfig:            {},
      diskTypeContent:        this.google.diskTypes,
      imageTypeContent:       this.google.imageTypesV2,
    });

    if (nodePool) {
      if (!get(this, 'oauthScopesSelection')) {
        const oauthScopes = get(nodePool.config, 'oauthScopes')
        const { oauthScopesSelection, scopeConfig } = this.google.unmapOauthScopes(oauthScopes);

        set(this, 'oauthScopesSelection', oauthScopesSelection);
        if (scopeConfig) {
          set(this, 'scopeConfig', scopeConfig);
        }
      }

      if (nodePool.version){
        set(this, 'originalPoolVersion', nodePool.version)
      }
    } else {
      setProperties(this, {
        oauthScopesSelection: this.google.oauthScopeOptions.DEFAULT,
        scopeConfig:          this.google.defaultScopeConfig,
      });
    }
  },

  actions: {
    setNodeLabels(section) {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      set(this, 'nodePool.config.labels', section);
    },
    updateScopes() {
      const oauthScopesSelection = get(this, 'oauthScopesSelection');
      const scopeConfig = get(this, 'scopeConfig');

      next(() => {
        set(this.nodePool.config, 'oauthScopes', this.google.mapOauthScopes(oauthScopesSelection, scopeConfig));
      });
    },
  },

  scopeSelectionsChanged: observer('oauthScopesSelection', function() {
    this.send('updateScopes');
  }),

  autoscalingChanged: observer('nodePool.autoscaling.enabled', function() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    const { nodePool: { autoscaling } } = this;

    if (autoscaling?.enabled) {
      setProperties(this, {
        'nodePool.autoscaling.minNodeCount': 1,
        'nodePool.autoscaling.maxNodeCount': 3,
      });
    } else {
      next(this, () => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        if (!isEmpty(autoscaling?.minNodeCount)) {
          set(this, 'nodePool.autoscaling.minNodeCount', null);
        }

        if (!isEmpty(autoscaling?.maxNodeCount)) {
          set(this, 'nodePool.autoscaling.maxNodeCount', null);
        }
      });
    }
  }),

  // if true, set np.version to latest version <= cp version
  // if false, revert np.version
  upgradeVersionChanged: observer('upgradeVersion', 'maxAvailableVersion', function()  {
    const {
      upgradeVersion, originalPoolVersion, nodePool, maxAvailableVersion
    } = this

    if (upgradeVersion){
      set(nodePool, 'version', maxAvailableVersion)
    } else {
      set(nodePool, 'version', originalPoolVersion)
    }
  }),

  // if the pool is new, keep version in sync with cp version
  clusterVersionChanged: on('init', observer('clusterVersion', 'maxAvailableVersion', function(){
    const {
      maxAvailableVersion, isNewNodePool, nodePool
    } = this;

    if (isNewNodePool && maxAvailableVersion !== nodePool.version){
      set(nodePool, 'version', maxAvailableVersion)
    }
  })),

  scopeConfigChanged: on('init', observer('scopeConfig', function() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    set(this.nodePool.config, 'oauthScopes', this.google.mapOauthScopes(this.oauthScopesSelection, this.scopeConfig));
  })),

  // In create mode, the cluster version can fallback to the first item in the versionChoices array.
  // Similarly, defaultClusterVersion is used to synchronize the node version.
  defaultClusterVersion: computed('versionChoices', 'clusterVersion', function() {
    const { clusterVersion, versionChoices } = this;

    if (versionChoices.some((v) => v?.value === clusterVersion)) {
      return clusterVersion;
    } else {
      return versionChoices[0]?.value;
    }
  }),

  regionalTotalNodeCounts: computed('locationType', 'nodePool.initialNodeCount', 'locationContent.@each.checked', function() {
    const { locationType } = this;
    let totalLocations = this.locationContent.filterBy('checked').length;

    if (locationType === 'zonal') {
      // willSave in the cluster will add the selected zone as the default location in the locations array
      totalLocations = totalLocations + 1;
    }

    return this?.nodePool?.initialNodeCount * totalLocations;
  }),


  showManagementWarning: computed('originalCluster.gkeStatus.upstreamSpec.imported', 'nodePool.management.{autoUpgrade,autoRepair}', function() {
    const { nodePool, originalCluster } = this;

    const isClusterImported = !isEmpty(originalCluster) && originalCluster?.gkeStatus?.upstreamSpec?.imported;

    if (isClusterImported && ( !nodePool?.management?.autoRepair || !nodePool?.management?.autoUpgrade )) {
      return true;
    }

    return false;
  }),

  originalClusterVersion: computed('originalCluster.gkeConfig.kubernetesVersion', 'originalCluster.gkeStatus.upstreamSpec.kubernetesVersion', function() {
    if (!isEmpty(get(this, 'originalCluster.gkeConfig.kubernetesVersion'))) {
      return get(this, 'originalCluster.gkeConfig.kubernetesVersion');
    }

    if (!isEmpty(get(this, 'originalCluster.gkeStatus.upstreamSpec.kubernetesVersion'))) {
      return get(this, 'originalCluster.gkeStatus.upstreamSpec.kubernetesVersion');
    }

    return '';
  }),

  clusterWillUpgrade: computed('clusterVersion', 'originalClusterVersion', function(){
    const { clusterVersion, originalClusterVersion } = this;

    return !!clusterVersion && !!originalClusterVersion && clusterVersion !== originalClusterVersion
  }),

  isNewNodePool: computed('nodePool.isNew', function() {
    return this?.nodePool?.isNew ? true : false;
  }),

  /**
   * This property is used to show/hide a np version upgrade checkbox
   * when the box is checked the np is upgraded to latest node version that is <= cp version
   * with new node pools, the version is always kept in sync with the cp version so no checkbox shown
   */
  upgradeAvailable: computed('isNewNodePool', 'clusterWillUpgrade', function(){
    const { isNewNodePool, clusterWillUpgrade } = this;

    return !isNewNodePool && clusterWillUpgrade
  }),


  // GCP api provides a separate list of versions for node pools, which can be upgraded to anything <= control plane version
  maxAvailableVersion: computed('clusterVersion', 'nodeVersions.[]', function() {
    const { clusterVersion, nodeVersions } = this;

    const availableVersions = nodeVersions.filter((nv) => {
      try {
        const lteCP = Semver.lte(nv, clusterVersion, { includePreRelease: true })

        return lteCP
      } catch {
        return
      }
    })

    return availableVersions[0]
  }),

  editedMachineChoice: computed('nodePool.config.machineType', 'machineChoices', function() {
    return get(this, 'machineChoices').findBy('name', get(this, 'nodePool.config.machineType'));
  }),

  machineChoices: computed('machineTypes.[]', function() {
    let out = (get(this, 'machineTypes') || []).slice();

    out.forEach((obj) => {
      setProperties(obj, {
        displayName: `${ obj.name  } (${  obj.description  })`,
        group:       obj.name.split('-')[0],
        sortName:    sortableNumericSuffix(obj.name),
      })
    });

    return out.sortBy('sortName')
  }),

});
