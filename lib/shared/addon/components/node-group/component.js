import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  scope: service(),

  fullColspan: null,
  afterName: 0,
  showState: false,
  afterState: 0,
  alignState: 'text-center',
  showActions: true,
  nameSpan: null,

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
    
    const nameSpan = get(this,'fullColspan') - 
      ( get(this, 'afterName') ? 1 : 0 ) - 
      ( get(this, 'showState') ? 1 : 0 ) -
      ( get(this, 'afterState') ? 1 : 0 ) -
      ( get(this, 'showActions') ? 1 : 0 );

    set(this, 'nameSpan', nameSpan);
  },
});
