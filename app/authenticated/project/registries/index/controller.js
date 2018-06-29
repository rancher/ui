import { alias } from '@ember/object/computed';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

// const NONE = 'none';

export default Controller.extend({
  projectController: controller('authenticated.project'),

  prefs:       service(),
  scope:       service(),
  queryParams:  ['sortBy'],
  sortBy:       'name',
  headers:     [
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

  group:        alias('projectController.group'),
  groupTableBy: alias('projectController.groupTableBy'),

  rows: function() {

    const proj = get(this, 'model.projectDockerCredentials').slice();
    const ns = get(this, 'model.namespacedDockerCredentials').slice();
    const out = proj.concat(ns);

    return out;

  }.property('model.projectDockerCredentials.[]', 'model.namespacedDockerCredentials.[]'),
});
