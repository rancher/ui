import Component from '@ember/component';
import layout from './template';
import { INSTANCE_TYPES } from 'shared/utils/amazon';
import { get, set, observer, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { equal } from '@ember/object/computed';

export default Component.extend({
  layout,
  classNames:    ['row', 'mb-20'],

  instanceTypes: INSTANCE_TYPES,

  clusterConfig: null,
  keyPairs:      null,
  mode:          null,
  model:         null,
  versions:      null,

  editing:       equal('mode', 'edit'),
  actions: {
    setTags(section) {
      set(this, 'model.tags', section);
    },

    setLabels(section) {
      set(this, 'model.labels', section);
    },
  },

  shouldDisableVersionSelect: computed('clusterConfig.kubernetesVersion', function() {
    const {
      clusterConfig,
      model,
    } = this;


    if (get(model, 'version') === get(clusterConfig, 'kubernetesVersion') ) {
      return true;
    }

    return false;
  }),

  clusterVersionDidChange: on('init', observer('clusterConfig.kubernetesVersion', function() {
    const { clusterConfig, editing } = this;

    if (get(clusterConfig, 'kubernetesVersion') && !editing) {
      set(this, 'model.version', clusterConfig.kubernetesVersion);
    }
  })),

  removeNodeGroup() {
    throw new Error('remove node group action is required!');
  },

});
