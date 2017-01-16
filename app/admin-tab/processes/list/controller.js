import Ember from 'ember';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),

  queryParams: ['which','sortBy','descending'],
  which: 'running',
  sortBy: 'id',
  descending: false,

  headers: [
    {
      displayName: 'ID',
      name: 'id',
      sort: ['id:desc'],
      width: '75px',
    },
    {
      displayName: 'Name',
      name: 'processName',
      sort: ['processName','id:desc'],
    },
    {
      displayName: 'Resource',
      name: 'resource',
      sort: ['resourceType','resourceId','id:desc'],
      searchField: ['resourceType','resourceId'],
    },
    {
      displayName: 'Exit Reason',
      name: 'exitReason',
      sort: ['exitReason','id'],
      width: '150px',
    },
    {
      displayName: 'Start Time',
      name: 'startTime',
      sort: ['startTime','id:desc'],
      width: '100px',
      searchField: false,
    },
    {
      displayName: 'End Time',
      name: 'endTime',
      sort: ['endTime:desc','id:desc'],
      width: '100px',
      searchField: false,
    },
    {
      displayName: 'Run Time',
      name: 'runTime',
      sort: ['runTime:desc','id'],
      width: '100px',
      searchField: false,
    },
  ],
});
