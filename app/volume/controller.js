import Ember from 'ember';

export default Ember.Controller.extend({
  headers: [
    {
      name: 'instanceName',
      sort: ['instanceName:desc', 'instanceId:desc'],
      translationKey: 'volumesPage.mounts.table.instance',
    },
    {
      name: 'path',
      sort: ['path'],
      translationKey: 'volumesPage.mounts.table.path',
    },
    {
      name: 'permission',
      sort: ['permission'],
      translationKey: 'volumesPage.mounts.table.permission',
    },
    {
      name: 'volumeName',
      translationKey: 'volumesPage.mounts.table.volume',
      sort: ['volumeName:desc', 'volumeId:desc'],
    },
  ],
});
