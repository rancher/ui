import Ember from 'ember';
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
    var out = this.get('model.stacks').filterBy('isFromCatalog', true);

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('system', false);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    out = out.filter((obj) => obj.get('type').toLowerCase() !== 'kubernetesstack');

    return out;

  }.property('model.stacks.@each.{type,isFromCatalog,tags}','tags'),
});
