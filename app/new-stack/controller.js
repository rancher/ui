import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { tagChoices } from 'ui/models/namespace';

export default Controller.extend(NewOrEdit, {
  error:     null,
  editing:   false,
  compose:   null,
  files:     null,
  answers:   null,
  allStacks: null,
  init() {
    this._super(...arguments);
    this.set('allStacks', this.get('store').all('stack'));
  },

  actions: {
    addTag(tag) {
      let neu = this.get('model.tags')||[];
      neu.addObject(tag);
      this.set('model.tags', tags);
    },

    answersChanged(answers) {
      this.set('primaryResource.answers', answers);
    },
  },

  willSave() {
    let outFiles = {};

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
