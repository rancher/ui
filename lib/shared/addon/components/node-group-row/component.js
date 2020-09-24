import Component from '@ember/component';
import layout from './template';
import { INSTANCE_TYPES } from 'shared/utils/amazon';
import { get, set, observer, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { equal } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { alias } from '@ember/object/computed';

import { coerce, minor } from 'semver';

export default Component.extend({
  layout,
  classNames:    ['row', 'mb-20'],

  instanceTypes: INSTANCE_TYPES,

  clusterConfig:               null,
  keyPairs:                    null,
  mode:                        null,
  model:                       null,
  nodeGroupsVersionCollection: null,
  originalCluster:             null,
  versions:                    null,

  nameIsEditable:                  true,
  showNodeUpgradePreventionReason: false,
  upgradeVersion:                  false,

  creating:               equal('mode', 'new'),
  editing:                equal('mode', 'edit'),

  init() {
    this._super(...arguments);

    if ((get(this, 'nodeGroupsVersionCollection') || []).length === 1) {
      set(this, 'model.version', get(this, 'nodeGroupsVersionCollection.firstObject'))
    }

    if (this.editing) {
      if (!isEmpty(this.model.nodegroupName)) {
        set(this, 'nameIsEditable', false);
      }
    }
  },

  actions: {
    setTags(section) {
      set(this, 'model.tags', section);
    },

    setLabels(section) {
      set(this, 'model.labels', section);
    },
  },

  originalClusterVersion: computed('originalCluster.eksConfig.kubernetesVersion', 'originalCluster.eksStatus.upstreamSpec.kubernetesVersion', function() {
    if (!isEmpty(get(this, 'originalCluster.eksConfig.kubernetesVersion'))) {
      return get(this, 'originalCluster.eksConfig.kubernetesVersion');
    }

    if (!isEmpty(get(this, 'originalCluster.eksStatus.upstreamSpec.kubernetesVersion'))) {
      return get(this, 'originalCluster.eksStatus.upstreamSpec.kubernetesVersion');
    }

    return '';
  }),

  upgradeAvailable: computed('clusterConfig.kubernetesVersion', 'model.version', 'originalClusterVersion', function() {
    const originalClusterVersion = get(this, 'originalClusterVersion');
    const clusterVersion         = get(this, 'clusterConfig.kubernetesVersion');
    const nodeVersion            = get(this, 'model.version');
    const mode                   = get(this, 'mode');

    const initalClusterMinorVersion = parseInt(minor(coerce(clusterVersion)), 10);
    const initalNodeMinorVersion   = parseInt(minor(coerce(nodeVersion)), 10);
    const diff                     = initalClusterMinorVersion - initalNodeMinorVersion;

    debugger;
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

    return diff === 1;
  }),

  clusterVersionDidChange: on('init', observer('clusterConfig.kubernetesVersion', function() {
    const { clusterConfig, editing } = this;

    if (get(clusterConfig, 'kubernetesVersion') && !editing) {
      set(this, 'model.version', clusterConfig.kubernetesVersion);
    }
  })),

  shouldUpgradeVersion: on('init', observer('upgradeVersion', function() {
    const { upgradeVersion } = this;
    const clusterVersion           = get(this, 'clusterConfig.kubernetesVersion');
    const nodeVersion              = get(this, 'model.version');

    if (upgradeVersion && clusterVersion !== nodeVersion) {
      set(this, 'model.version', clusterVersion);
    }
  })),

  removeNodeGroup() {
    throw new Error('remove node group action is required!');
  },

});
