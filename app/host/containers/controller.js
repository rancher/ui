import Ember from 'ember';
import ContainerSparkStats from 'ui/mixins/container-spark-stats';

export default Ember.Controller.extend(ContainerSparkStats, {
  statsSocket: null,

  sortableContent: Ember.computed.alias('model.instances'),
  sortBy: 'name',
  sorts: {
    state:    ['stateSort','name','id'],
    name:     ['name','id'],
    ip:       ['displayIp','name','id'],
    image:    ['imageUuid','command','name','id'],
  },
  headers: [
    {
      name:           'state',
      sort:           ['stateSort','name','id'],
      translationKey: 'hostsPage.hostPage.containersTab.table.header.state',
      width:          '125',
    },
    {
      name:           'name',
      sort:           ['name','id'],
      translationKey: 'hostsPage.hostPage.containersTab.table.header.name',
      width:          '125',
    },
    {
      name:           'ip',
      sort:           ['displayIp','name','id'],
      translationKey: 'hostsPage.hostPage.containersTab.table.header.ip',
      width:          '120',
    },
    {
      name:           'image',
      sort:           ['imageUuid','command','name','id'],
      translationKey: 'hostsPage.hostPage.containersTab.table.header.image',
      width:          '130',
    },
    {
      translationKey: 'hostsPage.hostPage.containersTab.table.header.stats',
      noSort:         true,
    },
    {
      isActions: true,
      width: '70',
    },
  ]
});
