import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import {tagChoices, tagsToArray} from 'ui/models/stack';

export default Ember.Controller.extend(NewOrEdit, {
  error: null,
  editing: false,

  compose: null,
  files: null,
  answers: null,

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

    answersChanged(answers) {
      this.set('primaryResource.answers', answers);
    },
  },

  willSave() {
    let outFiles = {};
    let compose = this.get('compose');
    if ( compose ) {
      outFiles['compose.yml'] = compose;
    }

    let userFiles = this.get('files')||[];
    Object.keys(userFiles).forEach((key) => {
      let val = userFiles[key];
      if ( key && val ) {
        outFiles[key] = val;
      }
    });

    this.set('primaryResource.templates', outFiles);
    return this._super(...arguments);
  },

  tagChoices: function() {
    return tagChoices(this.get('allStacks')).sort();
  }.property('allStacks.@each.grouping'),

  doneSaving: function() {
    return this.transitionToRoute('stack', this.get('primaryResource.id'));
  },
});
