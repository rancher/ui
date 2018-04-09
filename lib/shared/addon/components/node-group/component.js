import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  scope: service(),

  model: null,
  fullColspan: null,
  afterName: 0,
  showState: false,
  afterState: 0,
  alignState: 'text-center',
  showActions: true,

  nodes: null,
  nodeId: null,
  tagName: '',

  didReceiveAttrs() {
    const nodes = get(this, 'nodes');
    const nodeId = get(this, 'nodeId');
    if (nodes && nodeId) {
      const clusterId = get(this, 'scope.currentCluster.id');
      const targetNode = nodes.find(n => n.id === nodeId && n.clusterId === clusterId);
      set(this, 'model', targetNode);
    }
  },

  nameSpan: computed('fullColspan', 'afterName', 'showState', 'afterState', 'showActions', function () {
    let span = get(this, 'fullColspan') -
      get(this, 'afterName') -
      (get(this, 'showState') ? 1 : 0) -
      get(this, 'afterState') -
      (get(this, 'showActions') ? 1 : 0);

    return Math.max(span, 1);
  }),
});
