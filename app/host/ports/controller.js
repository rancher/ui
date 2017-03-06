import Ember from 'ember';

export default Ember.Controller.extend({
  sortBy: 'ip',
  headers:  [
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
});
