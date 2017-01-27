import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'name',
  headers: [
    {
      translationKey: 'generic.name',
      name: 'name',
      sort: ['name'],
      width: '150px'
    },
    {
      translationKey: 'processesPage.pools.table.activeTasks',
      name: 'activeTasks',
      sort: ['activeTasks','name'],
    },
    {
      translationKey: 'processesPage.pools.table.poolSize',
      name: 'poolSize',
      sort: ['poolSize','name'],
    },
    {
      translationKey: 'processesPage.pools.table.rejectedTasks',
      name: 'rejectedTasks',
      sort: ['rejectedTasks','name'],
    },
    {
      translationKey: 'processesPage.pools.table.completedTasks',
      name: 'completedTasks',
      sort: ['completedTasks','name'],
    },
    {
      translationKey: 'processesPage.pools.table.queueSize',
      name: 'queueSize',
      sort: ['queueSize','name'],
    },
    {
      translationKey: 'processesPage.pools.table.queueRemainingCapacity',
      name: 'queueRemainingCapacity',
      sort: ['queueRemainingCapacity','name'],
    },
  ],
});
