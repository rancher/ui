import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  queryParams: ['githubRepo','githubBranch','composeFile'],
  githubRepo: null,
  githubBranch: null,

  composeFiles: null,
  error: null,
  editing: false,

  doneSaving: function() {
    return this.transitionToRoute('applications-tab.compose-projects.compose-project', this.get('primaryResource.id'));
  },
});
