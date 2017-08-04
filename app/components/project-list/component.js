import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  sortBy:   'name',
  headers:  [
    {
      name:           'state',
      sort:           ['stateSort','name','id'],
      translationKey: 'generic.state',
      width:          125,
    },
    {
      name:           'name',
      sort:           ['name','id'],
      translationKey: 'generic.name',
    },
    {
      name:           'description',
      sort:           ['description','name','id'],
      translationKey: 'generic.description',
    },
    {
      name:           'orchestration',
      sort:           ['displayOrchestration','name','id'],
      translationKey: 'projectList.index.table.header.orchestration',
    },
    {
      name:           'default',
      sort:           false,
      translationKey: 'generic.default',
      width:          80,
    },
  ],
});
