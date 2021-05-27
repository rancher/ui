import Controller from '@ember/controller';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
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
  notEmbedded:       true,

  namespaces: alias('scope.currentProject.namespaces'),

  showSystemProjectWarning: computed.and('model.project.isSystemProject', 'notEmbedded'),

  init() {
    this._super(...arguments);
    this.set('nodes', this.get('store').all('node'));
    this.set('expandedInstances', []);

    const notEmbedded = window.top === window;

    this.set('notEmbedded', notEmbedded);
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

  groupChanged: observer('group', function() {
    let key = `prefs.${ C.PREFS.CONTAINER_VIEW }`;
    let cur = this.get(key);
    let neu = this.get('group');

    if ( cur !== neu ) {
      this.set(key, neu);
    }
  }),
  showClusterWelcome: computed('scope.currentCluster.state', 'nodes.[]', function() {
    return this.get('scope.currentCluster.state') === 'inactive' && !this.get('nodes.length');
  }),

  groupTableBy: computed('group', function() {
    if ( this.get('group') === NAMESPACE ) {
      return 'namespaceId';
    } else if ( this.get('group') === NODE ) {
      return 'nodeId';
    } else {
      return null;
    }
  }),

  preSorts: computed('groupTableBy', function() {
    if ( this.get('groupTableBy') ) {
      return ['namespace.isDefault:desc', 'namespace.displayName'];
    } else {
      return null;
    }
  }),

});
