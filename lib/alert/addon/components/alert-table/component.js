import Component from '@ember/component';
import { inject as service } from '@ember/service'
import { reads } from '@ember/object/computed';
import { get } from '@ember/object';

const headers = [
  {
    translationKey: 'generic.state',
    name:           'alertState',
    searchField:    'alertState',
    sort:           ['alertState', 'name'],
    width:          '120'
  },
  {
    translationKey: 'generic.name',
    name:           'name',
    sort:           ['name', 'id'],
    searchField:    ['name', 'description', 'displayName'],
    width:          '300'
  },
  {
    translationKey: 'alertPage.index.table.target',
    name:           'target',
    searchField:    ['nodeName', 'resourceKind', 'displayTargetType'],
    sort:           ['nodeName', 'resourceKind', 'displayTargetType', 'name'],
  },
  {
    translationKey: 'alertPage.index.table.condition',
    name:           'displayCondition',
    sort:           ['displayCondition', 'id'],
    searchField:    ['displayCondition', 'name'],
  },
  {
    translationKey: 'alertPage.index.table.recipients',
    name:           'recipients',
    searchField:    ['recipient', 'firstRecipient'],
    sort:           ['displayRecipient', 'name'],
  },
];

export default Component.extend({
  scope:             service(),
  // input
  model:             null,
  sortBy:            'name',
  headers,
  showNode:          true,
  showStats:         false,
  showInstanceState: true,
  paging:            true,
  bulkActions:       true,
  search:            true,
  searchText:        null,

  clusterId: reads('scope.currentCluster.id'),
  projectId: reads('scope.currentProject.id'),
  pageScope: reads('scope.currentPageScope'),

  filteredNotifiers: function() {
    const clusterId = get(this, 'clusterId');

    return get(this, 'notifiers').filterBy('clusterId', clusterId);
  }.property('clusterId', 'notifiers.@each.{clusterId}'),

  filteredAlerts: function() {
    const clusterId = get(this, 'clusterId');
    const projectId = get(this, 'projectId');
    const ps = get(this, 'pageScope');

    if (ps === 'cluster') {
      return get(this, 'alerts').filterBy('clusterId', clusterId);
    } else {
      return get(this, 'alerts').filterBy('projectId', projectId);
    }
  }.property('alerts.@each.{clusterId,projectId}', 'clusterId', 'projectId', 'pageScope'),
});
