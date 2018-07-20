import { alias } from '@ember/object/computed';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  prefs:             service(),
  scope:             service(),

  projectController: controller('authenticated.project'),
  queryParams:       ['sortBy'],
  sortBy:            'name',
  headers:           [
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
      name:           'registry',
      translationKey: 'cruRegistry.address.label',
      searchField:    ['displayAddress', 'searchAddresses'],
      sort:           ['displayAddress', 'name', 'id'],
    },
    {
      name:           'username',
      translationKey: 'cruRegistry.username.label',
      searchField:    ['firstUsername', 'searchUsernames'],
      sort:           ['firstUsername', 'name', 'id'],
    },
  ],

  group:             alias('projectController.group'),
  groupTableBy:      alias('projectController.groupTableBy'),

  rows: computed('model.projectDockerCredentials.[]', 'model.namespacedDockerCredentials.[]', function() {
    const proj = get(this, 'model.projectDockerCredentials').slice();
    const ns = get(this, 'model.namespacedDockerCredentials').slice();
    const out = proj.concat(ns);

    return out;
  }),
});
