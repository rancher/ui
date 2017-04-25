import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  actions: {
    changeContainer(container) {
      this.transitionToRoute('container', container.get('id'));
    }
  },
  sortBy: 'privatePort',
  queryParams: ['sortBy'],
  searchText: '',

  headers: [
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
});
