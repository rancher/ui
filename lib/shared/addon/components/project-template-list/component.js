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
      name:           'stacks',
      translationKey: 'projectList.indexTemplate.table.header.stacks',
      sort:           false,
    },
    {
      name:           'isPublic',
      translationKey: 'projectList.indexTemplate.table.header.isPublic',
      sort:           false,
      searchField:    false,
      width:          80,
    },
  ],
});
