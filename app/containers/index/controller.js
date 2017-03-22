import Ember from 'ember';
import {tagsToArray} from 'ui/models/stack';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),
  projectController: Ember.inject.controller('authenticated.project'),
  prefs: Ember.inject.service(),
  tags: Ember.computed.alias('projectController.tags'),

  queryParams: ['sortBy','mode'],
  sortBy: 'name',
  mode: 'list',

  _allStacks: null,
  init() {
    this.set('_allStacks', this.get('store').all('stack'));
  },

  filtered: function() {
    let out = this.get('model');
    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('isSystem', false);
    }

    var needTags = tagsToArray(this.get('tags'));
    if ( needTags.length ) {
      out = out.filter((obj) => {
        let stack = obj.get('stack');
        return stack && stack.hasTags(needTags);
      });
    }

    return out;
  }.property('model.@each.system','prefs.showSystemResources','tags'),

  simpleMode: function() {
    let list = this.get('_allStacks');
    if ( !this.get('prefs.showSystemResources') ) {
      list = list.filterBy('system', false);
    }

    let bad = list.findBy('isDefault', false);
    return !bad;
  }.property('_allStacks.@each.{state,isDefault}','prefs.showSystemResources'),

  groupBy: function() {
    if ( !this.get('simpleMode') && this.get('mode') === 'grouped' ) {
      return 'stack.id';
    } else {
      return null; 
    }
  }.property('simpleMode', 'mode'),
});
