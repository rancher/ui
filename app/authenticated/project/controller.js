import Ember from 'ember';
import { tagsToArray } from 'ui/models/stack';

const NONE = 'none';
const SERVICE = 'service';
const STACK = 'stack';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),
  projects: Ember.inject.service(),

  tags: '',
  group: STACK,
  queryParams: ['tags','group'],

  stacks: null,
  expandedInstances: null,

  init() {
    this._super(...arguments);
    this.set('stacks', this.get('store').all('stack'));
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
  },

  showClusterWelcome: function() {
    return this.get('projects.currentCluster.state') === 'inactive';
  }.property('projects.currentCluster.state'),

  simpleMode: function() {
    let list = this.get('stacks');
    if ( !this.get('prefs.showSystemResources') ) {
      list = list.filterBy('system', false);
    }

    let bad = list.findBy('isDefault', false);
    return !bad;
  }.property('stacks.@each.{system,isDefault}','prefs.showSystemResources'),

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
});
