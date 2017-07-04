import Ember from 'ember';
import { tagsToArray } from 'ui/models/stack';
import { searchFields as containerSearchFields } from 'ui/components/container-dots/component';
import { headers } from 'ui/containers/index/controller';

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  tags: Ember.computed.alias('projectController.tags'),
  sortBy: 'name',

  expandedInstances: null,

  init() {
    this._super(...arguments);
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

  preSorts: ['stack.isDefault:desc','stack.displayName'],
  extraSearchFields: ['id:prefix','displayIp:ip'],
  extraSearchSubFields: containerSearchFields,
  headers: headers,

  filteredStacks: function() {
    var needTags = tagsToArray(this.get('tags'));
    var out = this.get('model.stacks');

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('system', false);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    return out;
  }.property('model.stacks.@each.{grouping,system}','tags','prefs.showSystemResources'),

  instances: function() {
    let out = [];
    this.get('filteredStacks').forEach((stack) => {
      out.pushObjects(stack.get('services').filter((x) => x.get('isReal') && x.get('isBalancer')));
    });

    return out;
  }.property('filteredStacks.@each.services'),

  simpleMode: function() {
    let all = this.get('filteredStacks');
    if ( all.get('length') > 1 ) {
      return false;
    }

    let stack = all.objectAt(0);
    if ( stack.get('isDefault') ) {
      return true;
    }

    return false;
  }.property('filteredStacks.@each.name'),
});
