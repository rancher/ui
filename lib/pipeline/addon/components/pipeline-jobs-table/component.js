import Component from '@ember/component';

export const headers =  [
  {
    name:           'status',
    sort:           ['lastRunState'],
    searchField:    ['relevantState', 'lastRunState'],
    width:          '120px',
    translationKey: 'pipelinesPage.table.status',
  },
  {
    name:           'displayName',
    sort:           ['displayName'],
    searchField:    'displayName',
    translationKey: 'generic.name',
  },
  {
    name:           'lastRunId',
    sort:           ['lastStarted'],
    width:          '200px',
    searchField:    'activity',
    translationKey: 'pipelinesPage.lastActivity',
  },
];

export default Component.extend({
  sortBy:  'name',
  headers,
});
