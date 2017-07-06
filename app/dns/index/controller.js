import Ember from 'ember';

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),

  tags: Ember.computed.alias('projectController.tags'),
  simpleMode: Ember.computed.alias('projectController.simpleMode'),
  groupBy: Ember.computed.alias('projectController.groupBy'),
  showStack: Ember.computed.alias('projectController.showStack'),
  emptyStacks: Ember.computed.alias('projectController.emptyStacks'),
  expandedInstances: Ember.computed.alias('projectController.expandedInstances'),
  preSorts: Ember.computed.alias('projectController.preSorts'),

  queryParams: ['sortBy'],
  sortBy: 'name',

  actions: {
    toggleExpand() {
      this.get('projectController').send('toggleExpand', ...arguments);
    },
  },

  headers: [
    {
      name: 'expand',
      sort: false,
      searchField: null,
      width: 30
    },
    {
      name: 'state',
      sort: ['stack.isDefault:desc','stack.displayName','stateSort','displayName'],
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 120
    },
    {
      name: 'name',
      sort: ['stack.isDefault:desc','stack.displayName','displayName','id'],
      searchField: 'displayName',
      translationKey: 'generic.name',
    },
    {
      name: 'displayType',
      sort: ['displayType','displayName','id'],
      searchField: 'displayType',
      translationKey: 'generic.type',
    },
    {
      name: 'target',
      sort: false,
      searchField: 'displayTargets',
      translationKey: 'dnsPage.table.target',
    },
  ],

  rows: function() {
    let showStack = this.get('showStack');

    return this.get('model.services').filter((obj) => {
      return showStack[obj.get('stackId')] && !obj.get('isReal');
    });
  }.property('showStack','model.services.@each.{isReal}'),
});
