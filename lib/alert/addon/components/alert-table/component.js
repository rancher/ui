import Component from '@ember/component';
import {inject as service } from '@ember/service'
import { reads } from '@ember/object/computed';
import { get, set } from '@ember/object';

const headers = [
  {
    translationKey: 'generic.state',
    name: 'alertState',
    searchField: 'alertState',
    sort: ['alertState'],
    width: '120'
  },
  {
    translationKey: 'generic.name',
    name: 'name',
    sort: ['name', 'description', 'id'],
    searchField: ['name','description', 'displayName'],
    width: '200'
  },
  {
    translationKey: 'alertPage.index.table.target',
    name: 'target',
    searchField: ['target', 'displayTargetType'],
    sort: ['target', 'id'],
  },
  {
    translationKey: 'alertPage.index.table.condition',
    name: 'displayCondition',
    sort: ['displayCondition', 'id'],
    searchField: ['displayCondition'],
  },
  {
    translationKey: 'alertPage.index.table.recipients',
    name: 'recipients',
    searchField: ['recipient'],
    sort: ['recipients'],
  },
];

export default Component.extend({
  pageScope: reads('scope.currentPageScope'),
  scope: service(),

  // input
  model: null,
  sortBy: 'name',
  headers,
  showNode: true,
  showStats: false,
  showInstanceState: true,
  paging: true,
  bulkActions: true,
  search: true,
  searchText: null,

  filteredAlerts: function() {
    return get(this, 'model');
  }.property('model.[]'),
});
