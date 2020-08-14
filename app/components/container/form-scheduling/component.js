import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { observer, get, set } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  scope: service(),

  layout,
  scheduling: null,

  // Request a specific host
  requestedHostId: null,

  // Is requesting a specific host allowed
  canRequestHost: true,

  // Initial host to start with
  initialHostId: null,

  // Internal properties
  isRequestedHost: false,

  editing: true,

  advanced: false,

  classNames: ['accordion-wrapper'],

  _allNodes: null,

  init() {
    this._super(...arguments);
    set(this, '_allNodes', get(this, 'globalStore').all('node'));
    set(this, 'advanced', !get(this, 'editing'));
    if ( get(this, 'initialHostId') ) {
      set(this, 'isRequestedHost', true);
      set(this, 'requestedHostId', get(this, 'initialHostId'));
    }
  },

  didReceiveAttrs() {
    if ( !get(this, 'expandFn') ) {
      set(this, 'expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  isRequestedHostDidChange: observer('isRequestedHost', function() {
    const scheduling = get(this, 'scheduling');

    if ( get(this, 'isRequestedHost') ) {
      const hostId = get(this, 'requestedHostId') || get(this, 'hostChoices.firstObject.id');

      Object.keys(scheduling).forEach((key) => {
        if ( scheduling.node ) {
          delete scheduling.node[key];
        }
      });
      set(this, 'requestedHostId', hostId);
    } else {
      set(this, 'requestedHostId', null);
      delete scheduling.node['nodeId'];
    }
  }),

  requestedHostIdDidChange: observer('requestedHostId', function() {
    const hostId = get(this, 'requestedHostId');

    if ( get(this, 'scheduling.node') ) {
      set(this, 'scheduling.node.nodeId', hostId);
    } else {
      set(this, 'scheduling.node', { nodeId: hostId });
    }
  }),

  selectedChoice: computed('_allNodes.@each.{id,clusterId,name,state}', function() {
    return get(this, 'hostChoices').findBy('id', get(this, 'initialHostId'));
  }),

  hostChoices: computed('_allNodes.@each.{id,clusterId,name,state}', function() {
    const list = get(this, '_allNodes').filter((node) => !get(node, 'isUnschedulable'))
      .filterBy('clusterId', get(this, 'scope.currentCluster.id'))
      .map((host) => {
        let hostLabel = get(host, 'displayName');

        if ( get(host, 'state') !== 'active' ) {
          hostLabel += ` (${  get(host, 'state')  })`;
        }

        return {
          id:   get(host, 'id'),
          name: hostLabel,
        };
      });

    return list.sortBy('name', 'id');
  }),
});
