import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';

export const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'name', 'id'],
    type:           'string',
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['name', 'id'],
    translationKey: 'generic.name',
  },
  {
    name:           'namespace',
    translationKey: 'generic.namespace',
    searchField:    'namespace.displayName',
    sort:           ['namespace.displayName', 'name', 'id'],
  },
  {
    name:           'keys',
    translationKey: 'configMapsPage.table.keys',
    searchField:    'keys',
    sort:           ['firstKey', 'name', 'id'],
  },
  {
    classNames:     'text-right pr-20',
    name:           'created',
    translationKey: 'generic.created',
    sort:           ['created:desc', 'name', 'id'],
    searchField:    false,
    type:           'string',
    width:          150,
  },
];

export default Controller.extend({
  projectController: controller('authenticated.project'),

  queryParams:  ['sortBy'],
  sortBy:       'name',
  resource:    ['configmap'],

  headers,

  group:        alias('projectController.group'),
  groupTableBy: alias('projectController.groupTableBy'),

  rows: computed('model.configMaps.[].type', function() {
    return get(this, 'model.configMaps').filterBy('type', 'configMap');
  }),
});
