import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Component.extend(Sortable, {
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  sortBy: 'name',
  sorts: {
    state:        ['stateSort','name','id'],
    name:         ['name','id'],
    description:  ['description','name','id'],
    projectTemplate:['projectTemplate.name','name','id'],
    orchestration:['displayOrchestration','name','id'],
  },
});
