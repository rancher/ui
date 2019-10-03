import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

// const NONE = 'none';

export default Controller.extend({
  prefs:             service(),
  scope:             service(),
  projectController: controller('authenticated.project'),

  queryParams:  ['sortBy'],
  sortBy:       'name',
  resource:    ['namespacedsecret', 'secret'],

  headers: [
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
      translationKey: 'secretsPage.table.keys',
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
  ],

  group:        alias('projectController.group'),
  groupTableBy: alias('projectController.groupTableBy'),

  rows: computed('model.projectSecrets.[].type', 'model.namespacedSecrets.[].type', function() {
    const proj = get(this, 'model.projectSecrets').filterBy('type', 'secret');
    const ns = get(this, 'model.namespacedSecrets').filterBy('type', 'namespacedSecret');
    const out = proj.concat(ns);

    return out;
  }),
});
