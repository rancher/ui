import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import layout from './template';

const headers = [
  {
    translationKey: 'generic.state',
    name: 'state',
    searchField: 'state',
    sort: ['state'],
    width: '120'
  },
  {
    translationKey: 'generic.name',
    name: 'name',
    searchField: 'name',
    sort: ['name', 'id'],
  },
  {
    translationKey: 'generic.type',
    name: 'notifierType',
    sort: ['notifierType', 'notifierLabel', 'notifierValue', 'id'],
    searchField: ['notifierType', 'notifierLabel', 'notifierValue'],
  },
  {
    translationKey: 'notifierPage.index.table.created',
    name: 'created',
    searchField: 'displayCreated',
    sort: ['created', 'created', 'id'],
  },
];

export default Component.extend({
  scope: service(),
  clusterId: reads('scope.currentCluster.id'),
  layout,
  // input
  model: null,
  sortBy: 'name',
  headers,

  filteredNotifiers: function() {
    const data = this.get('model') || [];
    const clusterId = get(this, 'clusterId')
    return data.filterBy('clusterId', clusterId);
  }.property('model.@each.{clusterId}', 'clusterId'),
});
