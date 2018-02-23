import Component from '@ember/component';

export const headersAll =  [
  {
    name: 'isActive',
    sort: ['isActive'],
    searchField: 'isActive',
    translationKey: 'generic.state',
  },
  {
    name: 'name',
    sort: ['name'],
    searchField: 'name',
    translationKey: 'generic.name',
  },
  {
    name: 'repository',
    sort: ['repository'],
    width: 500,
    searchField: 'repository',
    translationKey: 'generic.repository',
  },
  {
    name: 'lastRunId',
    sort: ['lastRunId'],
    width: '200px',
    searchField: 'activity',
    translationKey: 'pipelinesPage.lastActivity',
  },
  {
    name: 'nextRunTime',
    sort: ['nextRunTime'],
    searchField: 'nextRunTime',
    translationKey: 'pipelinesPage.nextRun',
  },
  
];

export default Component.extend({
  stickyHeader: true,

  sortBy: 'name',
  // body: data.data,
  headers: function() {
    return headersAll;
  }.property(),
});
