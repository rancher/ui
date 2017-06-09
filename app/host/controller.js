import Ember from 'ember';
import ContainerSparkStats from 'ui/mixins/container-spark-stats';

export default Ember.Controller.extend(ContainerSparkStats, {
  application: Ember.inject.controller(),
  host:        Ember.computed.alias('model.host'),
  queryParams: ['sortBy'],
  sortBy:      'name',

  nonRootVolumes: function() {
    return this.get('model.storagePools').filter(function(volume) {
      return !volume.get('instanceId') && volume.get('state') !== 'purged';
    });
  }.property('model.@each.{instanceId,state}'),

  storageHeaders:  [
    {
      name:           'state',
      sort:           ['stateSort','displayUri','id'],
      translationKey: 'hostsPage.hostPage.storageTab.table.header.state',
      width:          125,
    },
    {
      name:           'hostPath',
      sort:           ['displayUri','id'],
      translationKey: 'hostsPage.hostPage.storageTab.table.header.hostPath',
    },
    {
      name:           'mounts',
      sort:           false,
      translationKey: 'hostsPage.hostPage.storageTab.table.header.mounts',
    },
  ],
  portHeaders:  [
    {
      name:           'ip',
      sort:           ['ipAddress','port'],
      translationKey: 'hostsPage.hostPage.portsTab.table.header.ip',
    },
    {
      name:           'port',
      sort:           ['port','ipAddress','instanceId'],
      translationKey: 'hostsPage.hostPage.portsTab.table.header.port',
    },
    {
      name:           'service',
      sort:           ['service.displayName','port','ipAddress'],
      translationKey: 'hostsPage.hostPage.portsTab.table.header.service',
    },
    {
      name:           'container',
      sort:           ['instance.displayName','port','ipAddress'],
      translationKey: 'hostsPage.hostPage.portsTab.table.header.container',
    },
  ],
  statsSocket: null,

  actions: {
    changeHost(host) {
      this.get('application').transitionToRoute('host', host.get('id'));
    },
  }
});
