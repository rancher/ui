import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  actions: {
    changeContainer(container) {
      this.transitionToRoute('container', container.get('id'));
    }
  },
  portSortBy: 'privatePort',
  queryParams: ['sortBy'],
  searchText: '',

  portHeaders: [
    {
      name: 'publicIp',
      sort: ['displayPublicIp','privatePort','protocol'],
      searchField: 'displayPublicIp',
      translationKey: 'generic.ipAddress',
    },
    {
      name: 'publicPort',
      sort: ['publicPort','privatePort','protocol'],
      searchField: 'publicPort',
      translationKey: 'containerPage.portsTab.table.public',
    },
    {
      name: 'privatePort',
      sort: ['privatePort','protocol'],
      searchField: 'privatePort',
      translationKey: 'containerPage.portsTab.table.private',
    },
    {
      name: 'protocol',
      sort: ['protocol','privatePort'],
      searchField: 'protocol',
      translationKey: 'containerPage.portsTab.table.protocol',
    },
  ],
  storageSortBy: 'state',
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
});
