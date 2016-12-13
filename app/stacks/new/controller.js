import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import {tagChoices, tagsToArray} from 'ui/models/stack';

export default Ember.Controller.extend(NewOrEdit, {
  queryParams: ['githubRepo','githubBranch','composeFiles','system'],
  githubRepo: null,
  githubBranch: null,
  composeFiles: null,
  system: false,

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

  groupChoices: function() {
    return tagChoices(this.get('allStacks')).sort();
  }.property('allStacks.@each.grouping'),

  willSave: function() {
    let out = this._super(...arguments);
    let externalId = '';
    if ( this.get('system') )
    {
      externalId = C.EXTERNAL_ID.KIND_SYSTEM + C.EXTERNAL_ID.KIND_SEPARATOR + 'user';
    }

    this.set('primaryResource.externalId', externalId);
    return out;
  },

  doneSaving: function() {
    return this.transitionToRoute('stack', this.get('primaryResource.id'));
  },
});
