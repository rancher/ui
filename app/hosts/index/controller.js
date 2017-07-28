import Ember from 'ember';
import C from 'ui/utils/constants';
import { headersWithoutHost as containerHeaders } from 'ui/components/container-table/component';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),
  projectController: Ember.inject.controller('authenticated.project'),

  mode: 'list',
  sortBy: 'name',
  queryParams: ['mode','sortBy'],
  expandedHosts: null,
  searchText: '',

  containerHeaders: containerHeaders,

  init() {
    this._super(...arguments);
    this.set('expandedHosts',[]);
  },

  actions: {
    newContainer(hostId) {
      this.transitionToRoute('containers.run', {queryParams: {hostId: hostId}});
    },

    toggleExpand(hostId) {
      let list = this.get('expandedHosts');
      if ( list.includes(hostId) ) {
        list.removeObject(hostId);
      } else {
        list.addObject(hostId);
      }
    },
  },

  headers: [
    {
      name: 'expand',
      sort: false,
      searchField: null,
      width: 30
    },
    {
      name: 'state',
      sort: ['stateSort','displayName'],
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 120
    },
    {
      name: 'name',
      sort: ['displayName','id'],
      searchField: 'displayName',
      translationKey: 'generic.name',
    },
    {
      name: 'ip',
      sort: ['displayIp','displayName'],
      searchField: 'displayIp',
      translationKey: 'generic.ipAddress',
      width: 130,
    },
    {
      name: 'memory',
      sort: ['memory','displayName'],
      searchField: 'memoryBlurb',
      width: 80,
      translationKey: 'hostsPage.index.table.memory',
    },
    {
      name: 'docker',
      sort: ['dockerEngineVersion','displayName'],
      searchField: 'dockerEngineVersion',
      width: 110,
      translationKey: 'hostsPage.index.table.docker',
    },
    {
      name: 'instanceState',
      sort: ['instanceCountSort:desc','displayName'],
      searchField: null,
      width: 140,
      icon: 'icon icon-lg icon-container',
      dtTranslationKey: 'hostsPage.index.table.instanceState',
      translationKey: 'hostsPage.index.table.instanceStateWithIcon',
    },
  ],

  extraSearchFields: [
    'displayUserLabelStrings',
    'requireAnyLabelStrings',
  ],

  extraSearchSubFields: [
    'displayUserLabelStrings',
  ],

  modeChanged: function() {
    let key = `prefs.${C.PREFS.HOST_VIEW}`;
    let cur = this.get(key);
    let neu = this.get('mode');
    if ( cur !== neu ) {
      this.set(key,neu);
    }
  }.observes('mode'),
});
