import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  application: Ember.inject.controller(),

  project: Ember.computed.alias('model.project'),
  sortableContent: Ember.computed.alias('project.projectMembers'),
  sortBy: 'name',
  sorts: {
    name:   ['externalId'],
    type:   ['externalIdType','externalId'],
    role:   ['role','externalId'],
  },

  actions: {
    changeProject(project) {
      this.get('application').transitionToRoute('settings.project-detail', project.get('id'));
    },
  },
});
