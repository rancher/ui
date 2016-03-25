import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  sortableContent: Ember.computed.alias('model.project.unremovedServices'),
  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    services:     ['services.length','name','id'],
  },

  actions: {
    changeProject(project) {
      this.transitionToRoute('applications-tab.compose-projects.compose-project', project.get('id'));
    },
  }
});
