import Ember from 'ember';
import C from 'ui/utils/constants';
import { tagsToArray } from 'ui/models/stack';

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  tags: Ember.computed.alias('projectController.tags'),
  sortBy: 'name',

  expandedStacks: null,

  init() {
    this._super(...arguments);
    this.set('expandedStacks',[]);
  },

  actions: {
    toggleExpand(instId) {
      let list = this.get('expandedStacks');
      if ( list.includes(instId) ) {
        list.removeObject(instId);
      } else {
        list.addObject(instId);
      }
    },
  },

  filteredStacks: function() {
    var needTags = tagsToArray(this.get('tags'));
    var out      = this.get('model.stacks').filter((stack) => {
      if (stack.get('isFromCatalog') && C.REMOVEDISH_STATES.indexOf(stack.get('state')) === -1) {
        return true;
      }
      return false;
    });

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('system', false);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    return out;
  }.property('model.stacks.@each.{type,isFromCatalog,tags,state}','tags','prefs.showSystemResources'),
});
