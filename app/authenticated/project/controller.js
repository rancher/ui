import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import { tagsToArray } from 'ui/models/namespace';

//const NONE = 'none';
//const WORKLOAD = 'workload';
const NAMESPACE = 'namespace';

export default Controller.extend({
  prefs: service(),
  scope: service(),

  tags: '',
  group: NAMESPACE,
  queryParams: ['tags','group'],

  namespaces: null,
  nodes: null,
  expandedInstances: null,

  init() {
    this._super(...arguments);
    this.set('namespaces', this.get('store').all('namespace'));
    this.set('nodes', this.get('store').all('node'));
    this.set('expandedInstances',[]);
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
      this.set('prefs.projects-warning','hide');
    }
  },

  showWarning: function() {
    return this.get('prefs.projects-warning') !== 'hide';
  }.property('prefs.projects-warning'),
  showClusterWelcome: function() {

    return this.get('scope.currentCluster.state') === 'inactive' && !this.get('nodes.length');
  }.property('scope.currentCluster.state','nodes.[]'),

  simpleMode: false,
  /*
  simpleMode: function() {
    let list = this.get('namespaces');
    let bad = list.findBy('isDefault', false);
    return !bad;
  }.property('namespaces.@each.{system,isDefault}'),
  */

  groupTableBy: function() {
    if ( this.get('group') === NAMESPACE && !this.get('simpleMode') ) {
      return 'namespace';
    } else {
      return null;
    }
  }.property('simpleMode', 'group'),

  preSorts: function() {
    if ( this.get('groupTableBy') ) {
      return ['namespace.isDefault:desc','namespace.displayName'];
    } else {
      return null;
    }
  }.property('groupTableBy'),

  showNamespace: function() {
    let needTags = tagsToArray(this.get('tags'));
    let simpleMode = this.get('simpleMode');

    let out = {};
    let ok;
    this.get('namespaces').forEach((obj) => {
      ok = true;

      if ( ok && !simpleMode && !obj.hasTags(needTags) ) {
        ok = false;
      }

      out[obj.get('id')] = ok;
    });

    return out;
  }.property('namespaces.@each.{grouping,system}','tags','simpleMode'), // Grouping is used for tags

  groupChanged: function() {
    let key = `prefs.${C.PREFS.CONTAINER_VIEW}`;
    let cur = this.get(key);
    let neu = this.get('group');
    if ( cur !== neu ) {
      this.set(key,neu);
    }
  }.observes('group'),
});
