import Ember from 'ember';

export default Ember.Component.extend({
  prefs: Ember.inject.service(),

  stickyHeader: true,

  showHost: true,
  showStats: false,
  showInstanceState: true,
  pagingLabel: 'pagination.entry',

  sortBy: 'name',

  headers: [
    {
      name: 'time',
      sort: ['createdTs:desc','id:desc'],
      searchField: 'created',
      translationKey: 'serviceLog.time',
      width: 150,
    },
    {
      name: 'level',
      sort: ['level','createdTs:desc','id:desc'],
      translationKey: 'serviceLog.level',
      width: 100,
    },
    {
      name: 'event',
      sort: ['eventType','createdTs:desc','id:desc'],
      searchField: 'eventType',
      translationKey: 'serviceLog.event',
      width: 200,
    },
    {
      name: 'detail',
      sort: ['description','createdTs:desc','id:desc'],
      searchField: 'description',
      translationKey: 'serviceLog.detail',
    },
  ],
});
