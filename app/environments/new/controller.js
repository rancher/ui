import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  queryParams: ['githubRepo','githubBranch','composeFiles'],
  githubRepo: null,
  githubBranch: null,
  composeFiles: null,

  error: null,
  editing: false,

  actions: {
    readFile(field, text) {
      this.get('primaryResource').set(field,text);
    },
  },

  doneSaving: function() {
    return this.transitionToRoute('environment', this.get('primaryResource.id'));
  },
});
