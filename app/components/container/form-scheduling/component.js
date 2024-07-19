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
    set(this, '_allNodes', this.globalStore.all('node'));
    set(this, 'advanced', !this.editing);
    if ( this.initialHostId ) {
      set(this, 'isRequestedHost', true);
      set(this, 'requestedHostId', this.initialHostId);
    }
  },

  didReceiveAttrs() {
    if ( !this.expandFn ) {
      set(this, 'expandFn', (item) => {
        item.toggleProperty('expanded');
      });
    }
  },

  isRequestedHostDidChange: observer('isRequestedHost', function() {
    const scheduling = this.scheduling;

    if ( this.isRequestedHost ) {
      const hostId = this.requestedHostId || get(this, 'hostChoices.firstObject.id');

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
    const hostId = this.requestedHostId;

    if ( get(this, 'scheduling.node') ) {
      set(this, 'scheduling.node.nodeId', hostId);
    } else {
      set(this, 'scheduling.node', { nodeId: hostId });
    }
  }),

  selectedChoice: computed('_allNodes.@each.{clusterId,id,name,state}', 'hostChoices', 'initialHostId', function() {
    return this.hostChoices.findBy('id', this.initialHostId);
  }),

  hostChoices: computed('_allNodes.@each.{clusterId,id,name,state}', 'scope.currentCluster.id', function() {
    const list = this._allNodes.filter((node) => !get(node, 'isUnschedulable'))
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
