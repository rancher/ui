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

// Filter the image list for the given k8s version
function filterVersions(options, version) {
  if (!version) {
    return options;
  }

  return options.filter((option) => {
    const k8s = option.k8sVersion;
    const withoutPre = version.split('-')[0];

    return !k8s || Semver.satisfies(withoutPre, k8s);
  });
}

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

  init() {
    this._super(...arguments);

    const {
      nodePool,
      clusterVersion,
      defaultClusterVersion
    } = this;

    setProperties(this, {
      scopeConfig:            {},
      diskTypeContent:        this.google.diskTypes,
      imageTypeContent:       filterVersions(this.google.imageTypesV2, this.cluster?.gkeConfig?.kubernetesVersion),
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

      if (isEmpty(nodePool?.version) && !isEmpty(clusterVersion)) {
        set(this, 'nodePool.version', defaultClusterVersion);
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

  editingUpdateNodeVersion: observer('isNewNodePool', 'clusterVersion', function() {
    const { isNewNodePool, clusterVersion } = this;
    const nodeVersion    = get(this, 'nodePool.version');

    if (isNewNodePool && clusterVersion !== nodeVersion) {
      set(this, 'nodePool.version', clusterVersion);
    }
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

  // Ensure we update the GKE image list when the kubernetes version changes
  kubeVersionChanged: on('init', observer('controlPlaneVersion', function() {
    const nodeVersion    = get(this, 'nodePool.version');

    // Re-filter the image list based on the Kubernetes version
    // Might need to auto-select a different version if the current one does not exist in the new list
    const currentImage = get(this, 'nodePool.config.imageType');
    const currentImageList = get(this, 'imageTypeContent');
    const currentItem = currentImageList.find((item) => item.value === currentImage);

    // Filter the list again based on the new k8s version
    const newImageList = filterVersions(this.google.imageTypesV2, nodeVersion);

    // Check that the current version still exists in the new list
    if (!newImageList.find((item) => item.value === currentImage)) {
      let newItem = currentItem?.replaceWith;

      // No longer exists, so look to see if the current item indicates what to use instead (and that exists)
      if (newItem && !newImageList.find((item) => item.value === newItem)) {
        newItem = undefined;
      }

      // Fallback is COS_CONTAINERD
      newItem = newItem || 'COS_CONTAINERD';

      set(this, 'nodePool.config.imageType', newItem);
    }

    // Update thew image list
    set(this, 'imageTypeContent', newImageList);
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

  upgradeAvailable: computed('clusterVersion', 'mode', 'nodePool.version', 'defaultClusterVersion', function() {
    const { clusterVersion, defaultClusterVersion } = this;
    const nodeVersion = get(this, 'nodePool.version');

    if (isEmpty(clusterVersion) || isEmpty(nodeVersion)) {
      return false;
    }

    const nodeIsLess = Semver.lt(nodeVersion, clusterVersion, { includePrerelease: true });
    const clusterVersionIsAlsoTheMaxVersion = clusterVersion === defaultClusterVersion;

    if (nodeIsLess && clusterVersionIsAlsoTheMaxVersion) {
      return true;
    }

    return false;
  }),

  isNewNodePool: computed('nodePool.isNew', function() {
    return this?.nodePool?.isNew ? true : false;
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


  shouldUpgradeVersion: on('init', observer('upgradeVersion', 'clusterVersion', function() {
    const { upgradeVersion, clusterVersion } = this;
    const nodeVersion    = get(this, 'nodePool.version');

    if (upgradeVersion && clusterVersion !== nodeVersion) {
      set(this, 'nodePool.version', clusterVersion);
    }
  })),

});
