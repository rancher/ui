import Component from '@ember/component';

export const headers =  [
  {
    name:           'run',
    sort:           ['run'],
    searchField:    ['run'],
    width:          '80px',
    translationKey: 'pipelineDetailPage.activity.table.runNumber',
  },
  {
    name:           'executionState',
    sort:           ['executionState'],
    searchField:    ['relevantState', 'executionState'],
    width:          '120px',
    translationKey: 'pipelineDetailPage.activity.table.status',
  },
  {
    name:           'branch',
    sort:           ['branch'],
    searchField:    ['branch'],
    width:          '120px',
    translationKey: 'pipelineDetailPage.activity.table.branch',
  },
  {
    name:           'message',
    sort:           ['message', 'shortCommit', 'branch'],
    searchField:    ['message', 'shortCommit', 'branch'],
    translationKey: 'pipelineDetailPage.activity.table.commit',
  },
  {
    name:           'startedTimeStamp',
    sort:           ['startedTimeStamp'],
    width:          '150px',
    translationKey: 'pipelineDetailPage.activity.table.triggered',
  },
];

export default Component.extend({
  sortBy:     'run',
  headers,
  executions: null,
});
