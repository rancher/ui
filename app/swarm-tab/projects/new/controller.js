import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Controller.extend(NewOrEdit, {
  queryParams: ['githubRepo','githubBranch','composeFile'],
  githubRepo: null,
  githubBranch: null,
  composeFile: null,

  composeFiles: null,
  error: null,
  editing: false,

  doneSaving: function() {
    return this.transitionToRoute('swarm-tab.projects');
  },
});
