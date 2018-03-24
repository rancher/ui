import { alias } from '@ember/object/computed';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  projectController: controller('authenticated.project'),

  sortBy: 'name',
  queryParams: ['sortBy'],
  group: alias('projectController.group'),
  groupTableBy: alias('projectController.groupTableBy'),

  resource: ['configmap'],

  headers: [
    {
      name: 'state',
      sort: ['sortState','name','id'],
      type: 'string',
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 125,
    },
    {
      name: 'name',
      sort: ['name','id'],
      translationKey: 'generic.name',
    },
    {
      name: 'namespace',
      translationKey: 'generic.namespace',
      searchField: 'namespace.displayName',
      sort: ['namespace.displayName','name','id'],
    },
    {
      name: 'keys',
      translationKey: 'configMapsPage.table.keys',
      searchField: 'keys',
      sort: ['firstKey','name','id'],
    },
    {
      name: 'created',
      translationKey: 'generic.created',
      sort: ['created:desc','name','id'],
      searchField: false,
      type: 'string',
      width: 150,
    },
  ],

  rows: function() {
    return get(this, 'model.configMaps').filterBy('type','configMap');
  }.property('model.configMaps.[].type'),
});
