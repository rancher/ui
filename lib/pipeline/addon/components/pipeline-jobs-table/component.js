import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export const headersAll =  [
  {
    name:           'isActive',
    sort:           ['isActive'],
    searchField:    'isActive',
    translationKey: 'generic.state',
  },
  {
    name:           'name',
    sort:           ['name'],
    searchField:    'name',
    translationKey: 'generic.name',
  },
  {
    name:           'repository',
    sort:           ['repository'],
    width:          500,
    searchField:    'repository',
    translationKey: 'generic.repository',
  },
  {
    name:           'lastRunId',
    sort:           ['lastRunId'],
    width:          '200px',
    searchField:    'activity',
    translationKey: 'pipelinesPage.lastActivity',
  },
  {
    name:           'nextRunTime',
    sort:           ['nextRunTime'],
    searchField:    'nextRunTime',
    translationKey: 'pipelinesPage.nextRun',
  },

];

export default Component.extend({
  scope:        service(),
  stickyHeader: true,

  sortBy:    'name',
  projectId: reads('scope.currentProject.id'),
  // body: data.data,
  headers:   function() {

    return headersAll;

  }.property(),
  filtered:  function() {

    const data = get(this, 'body') || [];
    const projectId = get(this, 'projectId')

    return data.filterBy('projectId', projectId);

  }.property('body.@each.{projectId}', 'projectId'),
});
