import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy:  'name',
  headers: [
    {
      name:           'state',
      sort:           ['stateSort','name','id'],
      translationKey: 'generic.state',
      width:          125,
    },
    {
      name:           'name',
      sort:           ['name','id'],
      translationKey: 'generic.name',
    },
    {
      name:           'server',
      sort:           ['nfsConfig.server','name','id'],
      translationKey: 'backupTargetsPage.server.label',
    },
    {
      name:           'share',
      sort:           ['nfsConfig.label','name','id'],
      translationKey: 'backupTargetsPage.share.label',
    },
    {
      name:           'mountOptions',
      sort:           ['nfsConfig.mountOptions','name','id'],
      translationKey: 'backupTargetsPage.mountOptions.label',
    },
    {
      sort:           false,
      width:          75,
    },
  ],
});
