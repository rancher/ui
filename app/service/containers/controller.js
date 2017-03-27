import Ember from 'ember';
import ContainerSparkStats from 'ui/mixins/container-spark-stats';

export default Ember.Controller.extend(ContainerSparkStats, {
  sparkInstances: Ember.computed.alias('model.instances'),

  sortBy: 'name',
  headers:  [
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
      name:           'ip',
      sort:           ['sortIp','name','id'],
      translationKey: 'servicePage.containersTab.table.header.ipAddress',
      width:          110,
    },
    {
      name:           'host',
      sort:           ['primaryHost.displayName','name','id'],
      translationKey: 'servicePage.containersTab.table.header.host',
    },
    {
      name:           'image',
      sort:           ['imageUuid','command','name','id'],
      translationKey: 'servicePage.containersTab.table.header.image',
    },
    {
      translationKey: 'servicePage.containersTab.table.header.stats',
      sort:           false,
    },
  ],
});
