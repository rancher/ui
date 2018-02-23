import Component from '@ember/component';
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
  layout,
  // input
  model: null,
  sortBy: 'name',
  headers,

  filteredNotifiers: function() {
    const notifiers = this.get('model') || [];
    return notifiers;
  }.property('model.[]'),
});
