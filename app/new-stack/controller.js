import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import {tagChoices, tagsToArray} from 'ui/models/stack';

export default Ember.Controller.extend(NewOrEdit, {
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
      let neu = tagsToArray(this.get('model.group'));
      neu.addObject(tag);
      this.set('model.group', neu.join(', '));
    },

    answersChanged(answers) {
      this.set('primaryResource.answers', answers);
    },
  },

  testNames: function(el, idx, ary) {
    let error = false;
    if (el.includes('compose')) {
      if (el !== 'rancher-compose.yml' || el !== 'docker-compose.yml') {
        error = true;
      }
    }
    return error;
  },

  validate: function() {
    var model = this.get('primaryResource');
    var errors = model.validationErrors();

    let userFiles = this.get('files')||[];
    let fileNames = Object.keys(userFiles);

    // file name contains compose but not rancher-compose or docker-compose as it should
    if (fileNames.includes('compose') && (!fileNames.includes('rancher-compose.yml') && !fileNames.includes('docker-compose.yml'))) {
      errors.push('File name must match rancher-compose.yml or docker-compose.yml exaclty');
    }

    if ( errors.get('length') )
    {
      this.set('errors', errors);
      return false;
    }

    this.set('errors', null);
    return true;
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
