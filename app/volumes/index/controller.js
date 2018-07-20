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
      sort:           ['sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['displayName', 'id'],
      searchField:    'displayName',
      translationKey: 'volumesPage.claimName.label',
    },
    {
      name:           'size',
      sort:           ['sizeBytes'],
      search:         ['sizeBytes', 'displaySize'],
      translationKey: 'generic.size',
      width:          120
    },
    {
      name:           'volume',
      sort:           ['volume.displayName', 'displayName', 'id'],
      translationKey: 'volumesPage.volume.label',
      searchField:    null,
    },
    {
      name:           'storageClass',
      sort:           ['storageClass.displayName', 'displayName', 'id'],
      translationKey: 'volumesPage.storageClass.label',
      searchField:    null,
    },
  ],

  groupTableBy:      alias('projectController.groupTableBy'),
  expandedInstances: alias('projectController.expandedInstances'),
  preSorts:          alias('projectController.preSorts'),

  rows: alias('model.persistentVolumeClaims'),
});
