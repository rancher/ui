import Component from '@ember/component';
import layout from './template';
import { computed, get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  access: service(),
  scope:  service(),
  intl:   service(),


  layout,

  tagName:    'tr',
  classNames: ['main-row'],
  pool:       null,

  taintCapabilites:   alias('scope.currentCluster.capabilities.taintSupport'),

  deleteNotReadyAfterSecs: computed('pool.deleteNotReadyAfterSecs', {
    get() {
      let { pool: { deleteNotReadyAfterSecs = 0 } } = this;

      return deleteNotReadyAfterSecs / 60;
    },
    set(key, value) {
      let out = value * 60;

      set(this, 'pool.deleteNotReadyAfterSecs', out);

      return value;
    },
  }),

  groupedNodeTemplates: computed('filteredNodeTemplates', function() {
    const currentUserId = get(this, 'access.me.id');

    return get(this, 'filteredNodeTemplates').map((template) => {
      template.group = template.creatorId === currentUserId
        ? get(this, 'intl').t('clusterNew.rke.nodes.myTemplatesGroup')
        : get(this, 'intl').t('clusterNew.rke.nodes.othersTemplatesGroup');

      return template;
    }).sortBy('displayName');
  }),

  removePool() {
    throw new Error('removePool action is required!');
  },

  addNodeTemplate() {
    throw new Error('addNodeTemplate action is required!');
  },

  configAdvancedOptions() {
    throw new Error('configAdvancedOptions action is required!');
  }
});
