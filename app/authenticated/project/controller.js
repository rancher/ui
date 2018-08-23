import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';

// const NONE = 'none';
// const WORKLOAD = 'workload';
const NAMESPACE = 'namespace';
const NODE = 'node'

export default Controller.extend({
  prefs:    service(),
  scope:    service(),
  settings: service(),

  queryParams: ['group'],

  group:             NAMESPACE,
  nodes:             null,
  expandedInstances: null,

  namespaces:         alias('scope.currentProject.namespaces'),
  init() {
    this._super(...arguments);
    this.set('nodes', this.get('store').all('node'));
    this.set('expandedInstances', []);
  },

  actions: {
    toggleExpand(instId) {
      let list = this.get('expandedInstances');

      if ( list.includes(instId) ) {
        list.removeObject(instId);
      } else {
        list.addObject(instId);
      }
    },

    hideWarning() {
      this.set('prefs.projects-warning', 'hide');
    }
  },

  showClusterWelcome: function() {
    return this.get('scope.currentCluster.state') === 'inactive' && !this.get('nodes.length');
  }.property('scope.currentCluster.state', 'nodes.[]'),

  groupTableBy: function() {
    if ( this.get('group') === NAMESPACE ) {
      return 'namespaceId';
    } else if ( this.get('group') === NODE ) {
      return 'nodeId';
    } else {
      return null;
    }
  }.property('group'),

  preSorts: function() {
    if ( this.get('groupTableBy') ) {
      return ['namespace.isDefault:desc', 'namespace.displayName'];
    } else {
      return null;
    }
  }.property('groupTableBy'),

  groupChanged: function() {
    let key = `prefs.${ C.PREFS.CONTAINER_VIEW }`;
    let cur = this.get(key);
    let neu = this.get('group');

    if ( cur !== neu ) {
      this.set(key, neu);
    }
  }.observes('group'),
});
