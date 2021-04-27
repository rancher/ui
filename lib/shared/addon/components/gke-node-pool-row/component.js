import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { on } from '@ember/object/evented';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Semver/* , { coerce, minor } */ from 'semver';
// import { coerceVersion } from 'shared/utils/parse-version';
import { sortableNumericSuffix } from 'shared/utils/util';
import layout from './template';

export default Component.extend({
  google:          service(),
  serviceVersions: service('version-choices'),
  layout,

  cluster:               null,
  originalCluster:       null,
  nodePool:              null,
  nodeAdvanced:          false,
  oauthScopesSelection:  null,
  scopeConfig:           null,
  diskTypeContent:       null,
  imageTypeContent:      null,
  machineTypes:          null,
  nodeVersions:          null,
  controlPlaneVersion:   null,
  upgradeVersion:        false,

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

      if (isEmpty(this?.nodePool?.version) && !isEmpty(this?.cluster?.gkeConfig?.kubernetesVersion)) {
        set(this, 'nodePool.version', this?.cluster?.gkeConfig?.kubernetesVersion);
      }
    } else {
      setProperties(this, {
        oauthScopesSelection: this.google.oauthScopeOptions.DEFAULT,
        scopeConfig:          this.google.defaultScopeConfig,
        labels:               [],
      });
    }
  },

  actions: {
    setNodeLabels(section) {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      const out = []

      for (let key in section) {
        out.pushObject(`${ key }=${ section[key] }`)
      }

      set(this, 'nodePool.config.labels', out);
    },
  },

  editingUpdateNodeVersion: observer('isNewNodePool', 'controlPlaneVersion', function() {
    const { isNewNodePool } = this;
    const clusterVersion           = get(this, 'controlPlaneVersion');
    const nodeVersion              = get(this, 'nodePool.version');

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

  scopeConfigChanged: on('init', observer('scopeConfig', function() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    set(this.nodePool.config, 'oauthScopes', this.google.mapOauthScopes(this.oauthScopesSelection, this.scopeConfig));
  })),

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

  upgradeAvailable: computed('controlPlaneVersion', 'mode', 'nodePool.version', 'originalClusterVersion', function() {
    const clusterVersion  = get(this, 'controlPlaneVersion');
    const nodeVersion     = get(this, 'nodePool.version');

    if (isEmpty(clusterVersion) || isEmpty(nodeVersion)) {
      return false;
    }

    const nodeIsLess = Semver.lt(nodeVersion, clusterVersion, { includePrerelease: true });

    if (nodeIsLess) {
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

  // versionChoices: computed('nodeVersions.[]', 'controlPlaneVersion', 'mode', function() {
  //   // google gke console allows the node version to be anything less than master version
  //   const {
  //     nodeVersions,
  //     controlPlaneVersion,
  //     mode,
  //   } = this;

  //   const coerceedVersion = coerceVersion(controlPlaneVersion);
  //   const maxVersionRange = `<= ${ coerceedVersion }`;
  //   let newVersions = this.serviceVersions.parseCloudProviderVersionChoices(nodeVersions, controlPlaneVersion, mode, maxVersionRange);

  //   const controlPlaneVersionMatch = newVersions.findBy('value', controlPlaneVersion);

  //   if (!isEmpty(controlPlaneVersionMatch)) {
  //     set(controlPlaneVersionMatch, 'label', `${ controlPlaneVersionMatch.label } (control plane version)`);

  //     set(this, 'nodePool.version', controlPlaneVersionMatch.value);

  //     const indexOfMatch = newVersions.indexOf(controlPlaneVersionMatch);

  //     if (indexOfMatch > 0) {
  //       // gke returns a semver like 1.17.17-gke.2800, 1.17.17-gke.3000
  //       // semver logic sorts these correctly but because we have to coerce the version, all versions in the 1.17.17 comebace
  //       // since they are sorted lets just find our CP master match index and cut everything off before that
  //       newVersions = newVersions.slice(indexOfMatch);
  //     }
  //   }

  //   return newVersions;
  // }),

  shouldUpgradeVersion: on('init', observer('upgradeVersion', 'controlPlaneVersion', function() {
    const { upgradeVersion } = this;
    const clusterVersion           = get(this, 'controlPlaneVersion');
    const nodeVersion              = get(this, 'nodePool.version');

    if (upgradeVersion && clusterVersion !== nodeVersion) {
      set(this, 'nodePool.version', clusterVersion);
    }
  })),

});
