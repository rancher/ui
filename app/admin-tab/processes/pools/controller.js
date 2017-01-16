import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'name',
  headers: [
    {
      displayName: 'Name',
      name: 'name',
      sort: ['name'],
      width: '150px'
    },
    {
      displayName: 'Active',
      name: 'activeTasks',
      sort: ['activeTasks','name'],
    },
    {
      displayName: 'Rejected',
      name: 'rejectedTasks',
      sort: ['rejectedTasks','name'],
    },
    {
      displayName: 'Completed',
      name: 'completedTasks',
      sort: ['completedTasks','name'],
    },
    {
      displayName: 'Pool Size',
      name: 'poolSize',
      sort: ['poolSize','name'],
    },
    {
      displayName: 'Queue Size',
      name: 'queueSize',
      sort: ['queueSize','name'],
    },
    {
      displayName: 'Queue Remain',
      name: 'queueRemainingCapacity',
      sort: ['queueRemainingCapacity','name'],
    },
  ],
});
