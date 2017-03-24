import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import {tagChoices, tagsToArray} from 'ui/models/stack';

export default Ember.Controller.extend(NewOrEdit, {
  error: null,
  editing: false,

  allStacks: null,
  init() {
    this._super(...arguments);
    this.set('allStacks', this.get('store').all('stack'));
  },

  actions: {
    addTag(tag) {
      let neu = tagsToArray(this.get('model.group'));
      neu.addObject(tag);
      this.set('model.group', neu.join(', '));
    },
  },

  tagChoices: function() {
    return tagChoices(this.get('allStacks')).sort();
  }.property('allStacks.@each.grouping'),

  doneSaving: function() {
    return this.transitionToRoute('stack', this.get('primaryResource.id'));
  },
});
