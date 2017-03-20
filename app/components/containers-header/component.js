import Ember from 'ember';
import { tagChoices } from 'ui/models/stack';
import { uniqKeys } from 'ui/utils/util';

export default Ember.Component.extend({
  projects: Ember.inject.service(),

  tags: null,

  allStacks: null,

  tagName: '',

  init() {
    this._super(...arguments);
    this.set('allStacks', this.get('store').all('stack'));
  },

  actions: {
    setTags(tags) {
      this.set('tags', tags);
    },
  },

  tagChoices: function() {
    let choices = uniqKeys(tagChoices(this.get('allStacks'))).sort();
    if ( !choices.length ) {
      return null;
    }

    return choices;
  }.property('allStacks.@each.tags'),
});
