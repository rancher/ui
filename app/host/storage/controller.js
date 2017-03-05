import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';

export default Ember.Controller.extend(Sortable, {
  nonRootVolumes: function() {
    return this.get('model').filter(function(volume) {
      return !volume.get('instanceId') && volume.get('state') !== 'purged';
    });
  }.property('model.@each.{instanceId,state}'),

  sortableContent: Ember.computed.alias(''),
  sortBy: 'name',
  sorts: {
    state:    ['stateSort','displayUri','id'],
    hostPath: ['displayUri','id'],
  },
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
