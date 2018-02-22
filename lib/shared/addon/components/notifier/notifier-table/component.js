import Component from '@ember/component';
import layout from './template';

const headers = [
  {
    translationKey: 'generic.type',
    name: 'notifierType',
    sort: ['notifierType'],
  },
  {
    translationKey: 'generic.name',
    name: 'displayName',
    sort: ['displayName'],
  },
  {
    translationKey: 'notifierPage.index.table.createdAt',
    name: 'createdAt',
    sort: ['createdAt'],
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
