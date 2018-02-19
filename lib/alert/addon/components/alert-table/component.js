import Component from '@ember/component';
import {inject as service } from '@ember/service'
import { reads } from '@ember/object/computed';
import { get, set } from '@ember/object';

const headers = [
  {
    translationKey: 'generic.state',
    name: 'state',
    sort: ['state'],
    width: '120'
  },
  {
    translationKey: 'generic.name',
    name: 'displayName',
    sort: ['displayName', 'description'],
    width: '200'
  },
  {
    translationKey: 'alertPage.index.table.target',
    name: 'target',
    sort: ['target', 'created'],
  },
  {
    translationKey: 'alertPage.index.table.condition',
    name: 'condition',
    sort: ['condition'],
  },
  {
    translationKey: 'alertPage.index.table.recipients',
    name: 'recipients',
    sort: ['recipients'],
  },
];

export default Component.extend({
  pageScope: reads('scope.currentPageScope'),
  scope: service(),

  extraSearchFields: ['displayName'],

  // input
  model: null,
  sortBy: 'created',
  headers,
  showNode: true,
  showStats: false,
  showInstanceState: true,
  paging: true,
  bulkActions: true,
  fullRows: true,
  search: true,
  searchText: null,
  subRow: true,

  filteredAlerts: function() {
    return get(this, 'model');
  }.property('model.[]'),
});
