import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  scope:             service(),

  projectController: controller('authenticated.project'),
  queryParams:       ['sortBy'],
  sortBy:            'name',

  headers: [
    {
      name:           'state',
      sort:           ['stack.isDefault:desc', 'stack.displayName', 'sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['stack.isDefault:desc', 'stack.displayName', 'displayName', 'id'],
      searchField:    'displayName',
      translationKey: 'generic.name',
    },
    {
      name:           'displayType',
      sort:           ['displayType', 'displayName', 'id'],
      searchField:    'displayType',
      translationKey: 'generic.type',
      width:          150,
    },
    {
      name:           'target',
      sort:           false,
      searchField:    'displayTargets',
      translationKey: 'dnsPage.table.target',
    },
  ],

  groupTableBy:      alias('projectController.groupTableBy'),
  expandedInstances: alias('projectController.expandedInstances'),
  preSorts:          alias('projectController.preSorts'),

  rows: alias('model.records'),
});
