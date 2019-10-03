import { alias } from '@ember/object/computed';
import { get, computed } from '@ember/object'
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  projectController: controller('authenticated.project'),

  sortBy:       'name',
  headers: [
    {
      name:           'state',
      sort:           ['sortState', 'name', 'id'],
      translationKey: 'generic.state',
      width:          125,
    },
    {
      name:           'name',
      sort:           ['name', 'id'],
      translationKey: 'generic.name',
    },
    {
      name:           'cn',
      searchField:    ['cn'],
      sort:           ['cn', 'id'],
      translationKey: 'certificatesPage.domainNames.labelText',
    },
    {
      name:           'expires',
      sort:           ['expiresDate', 'id'],
      translationKey: 'certificatesPage.expires',
      width:          120,
    },
  ],

  group:        alias('projectController.group'),
  groupTableBy: alias('projectController.groupTableBy'),

  rows: computed('model.projectCerts.[]', 'model.namespacedCerts.[]', function() {
    const proj = get(this, 'model.projectCerts').slice();
    const ns = get(this, 'model.namespacedCerts').slice();
    const out = proj.concat(ns);

    return out;
  }),
});
