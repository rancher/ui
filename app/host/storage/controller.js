import Ember from 'ember';

export default Ember.Controller.extend({
  nonRootVolumes: function() {
    return this.get('model').filter(function(volume) {
      return !volume.get('instanceId') && volume.get('state') !== 'purged';
    });
  }.property('model.@each.{instanceId,state}'),

  sortBy: 'name',
  headers:  [
    {
      name:           'state',
      sort:           ['stateSort','displayUri','id'],
      translationKey: 'hostsPage.hostPage.storageTab.table.header.state',
      width:          '125',
    },
    {
      name:           'hostPath',
      sort:           ['displayUri','id'],
      translationKey: 'hostsPage.hostPage.storageTab.table.header.hostPath',
    },
    {
      noSort:           true,
      translationKey: 'hostsPage.hostPage.storageTab.table.header.mounts',
    },
    {
      isActions: true,
      width: '75',
    },
  ],
});
