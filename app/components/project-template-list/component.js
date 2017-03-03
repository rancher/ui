import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),
  sortBy:   'name',
  headers:  [
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
      translationKey: 'projectList.indexTemplate.table.header.stacks',
      noSort:         true,
    },
    {
      translationKey: 'projectList.indexTemplate.table.header.isPublic',
      noSort:         true,
      width:          '80',
    },
    {
      isActions: true,
      width: '75px',
    },
  ],
});
