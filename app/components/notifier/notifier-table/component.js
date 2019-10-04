import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import layout from './template';

const headers = [
  {
    translationKey: 'generic.state',
    name:           'state',
    searchField:    'state',
    sort:           ['state', 'name'],
    width:          '120'
  },
  {
    translationKey: 'generic.name',
    name:           'name',
    searchField:    'name',
    sort:           ['name', 'id'],
  },
  {
    translationKey: 'generic.type',
    name:           'notifierType',
    sort:           ['notifierType', 'name'],
    searchField:    ['notifierType', 'notifierLabel', 'notifierValue'],
  },
  {
    classNames:     'text-right pr-20',
    translationKey: 'notifierPage.index.table.created',
    name:           'created',
    searchField:    'displayCreated',
    sort:           ['created', 'name'],
  },
];

export default Component.extend({
  scope:     service(),
  layout,
  // input
  model:     null,
  sortBy:    'name',
  headers,

  clusterId:         reads('scope.currentCluster.id'),
  filteredNotifiers: computed('model.@each.{clusterId}', 'clusterId', function() {
    const data = this.get('model') || [];
    const clusterId = get(this, 'clusterId')

    return data.filterBy('clusterId', clusterId);
  }),
});
