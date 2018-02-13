import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  scope: service(),

  scheduling: null,

  // Is this for a service(=true) or container(=false)
  isService: false,

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
    this.set('_allNodes', this.get('globalStore').all('node'));
    this.set('advanced', !this.get('editing'));
    if (this.get('initialHostId')) {
      this.set('isRequestedHost', true);
      this.set('requestedHostId', this.get('initialHostId'));
    }
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function (item) {
        item.toggleProperty('expanded');
      });
    }
  },

  isRequestedHostDidChange: function () {
    const scheduling = this.get('scheduling');
    if (this.get('isRequestedHost')) {
      var hostId = this.get('requestedHostId') || this.get('hostChoices.firstObject.id');
      Object.keys(scheduling).forEach(key => {
        delete scheduling.node[key];
      });
      this.set('requestedHostId', hostId);
    }
    else {
      this.set('requestedHostId', null);
      delete scheduling.node['nodeId'];
    }
  }.observes('isRequestedHost'),

  requestedHostIdDidChange: function () {
    var hostId = this.get('requestedHostId');
    this.set('scheduling.node.nodeId', hostId);
  }.observes('requestedHostId'),

  selectedChoice: computed('_allNodes.@each.{id,clusterId,name,state}', function () {
    return this.get('hostChoices').findBy('id', this.get('initialHostId'));
  }),

  hostChoices: function () {
    var list = this.get('_allNodes').filterBy('clusterId', this.get('scope.currentCluster.id')).map((host) => {
      var hostLabel = host.get('hostname');
      if (host.get('state') !== 'active') {
        hostLabel += ' (' + host.get('state') + ')';
      }

      return {
        id: host.get('id'),
        name: hostLabel,
      };
    });

    return list.sortBy('name', 'id');
  }.property('_allNodes.@each.{id,clusterId,name,state}'),

  statusClass: null,
  status: null,
});
