import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import { tagsToArray } from 'ui/models/stack';

//const NONE = 'none';
//const SERVICE = 'service';
const STACK = 'stack';

export default Controller.extend({
  prefs: service(),
  scope: service(),

  tags: '',
  group: STACK,
  queryParams: ['tags','group'],

  stacks: null,
  hosts: null,
  expandedInstances: null,

  init() {
    this._super(...arguments);
    this.set('stacks', this.get('store').all('stack'));
    this.set('hosts', this.get('store').all('host'));
    this.set('expandedInstances',[]);

    scheduleOnce('afterRender', () => {
      let key = `prefs.${C.PREFS.CONTAINER_VIEW}`;
      const group = this.get(key) || this.get('group');
      this.transitionToRoute({queryParams: {group}});
    });
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
  },

  showClusterWelcome: function() {
    return this.get('scope.currentCluster.state') === 'inactive' && !this.get('hosts.length');
  }.property('scope.currentCluster.state','hosts.[]'),

  simpleMode: false,
  /*
  simpleMode: function() {
    let list = this.get('stacks');
    if ( !this.get('prefs.showSystemResources') ) {
      list = list.filterBy('system', false);
    }

    let bad = list.findBy('isDefault', false);
    return !bad;
  }.property('stacks.@each.{system,isDefault}','prefs.showSystemResources'),
  */

  groupTableBy: function() {
    if ( this.get('group') === STACK && !this.get('simpleMode') ) {
      return 'stack.id';
    } else {
      return null;
    }
  }.property('simpleMode', 'group'),

  preSorts: function() {
    if ( this.get('groupTableBy') ) {
      return ['stack.isDefault:desc','stack.displayName'];
    } else {
      return null;
    }
  }.property('groupTableBy'),

  showStack: function() {
    let needTags = tagsToArray(this.get('tags'));
    let simpleMode = this.get('simpleMode');

    let out = {};
    let ok;
    this.get('stacks').forEach((obj) => {
      ok = true;
      if ( !this.get('prefs.showSystemResources') && obj.get('system') !== false ) {
        ok = false;
      }

      if ( ok && !simpleMode && !obj.hasTags(needTags) ) {
        ok = false;
      }

      if ( ok && obj.get('type').toLowerCase() === 'kubernetesstack' ) {
        ok = false;
      }

      out[obj.get('id')] = ok;
    });

    return out;
  }.property('stacks.@each.{grouping,system}','tags','prefs.showSystemResources','simpleMode'), // Grouping is used for tags

  emptyStacks: function() {
    return this.get('stacks').filterBy('isEmpty',true).map((x) => { return {ref: x} });
  }.property('stacks.@each.isEmpty'),

  groupChanged: function() {
    let key = `prefs.${C.PREFS.CONTAINER_VIEW}`;
    let cur = this.get(key);
    let neu = this.get('group');
    if ( cur !== neu ) {
      this.set(key,neu);
    }
  }.observes('group'),
});
