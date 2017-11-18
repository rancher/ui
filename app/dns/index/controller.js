import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  projectController: controller('authenticated.project'),
  scope: service(),

  tags: alias('projectController.tags'),
  simpleMode: alias('projectController.simpleMode'),
  groupTableBy: alias('projectController.groupTableBy'),
  showNamespace: alias('projectController.showNamespace'),
  emptyNamespaces: alias('projectController.emptyNamespaces'),
  expandedInstances: alias('projectController.expandedInstances'),
  preSorts: alias('projectController.preSorts'),

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
      sort: ['stack.isDefault:desc','stack.displayName','sortState','displayName'],
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
    let showNamespace = this.get('showNamespace');

    return this.get('model.services').filter((obj) => {
      return showNamespace[obj.get('stackId')] && !obj.get('isReal');
    });
  }.property('showNamespace','model.services.@each.{isReal}'),
});
