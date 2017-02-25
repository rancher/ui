import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  prefs: Ember.inject.service(),

  bulkActionHandler: Ember.inject.service(),
  bulkActionsList: C.BULK_ACTIONS,

  mode: 'list',
  sortBy: 'name',
  queryParams: ['mode','sortBy'],
  expandedHosts: null,

  init() {
    this._super(...arguments);
    this.set('expandedHosts',[]);
  },

  actions: {
    newContainer(hostId) {
      this.transitionToRoute('containers.new', {queryParams: {hostId: hostId}});
    },

    applyBulkAction(name, selectedElements) {
      this.get('bulkActionHandler')[name](selectedElements);
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

  showSystem: Ember.computed(`prefs.${C.PREFS.SHOW_SYSTEM}`, {
    get() {
      return this.get(`prefs.${C.PREFS.SHOW_SYSTEM}`) !== false;
    },

    set(key, value) {
      this.set(`prefs.${C.PREFS.SHOW_SYSTEM}`, value);
      return value;
    }
  }),

  show: Ember.computed('showSystem', function() {
    return this.get('showSystem') === false ? 'standard' : 'all';
  }),

  listLinkOptions: {
    route: 'hosts',
    options: {
      mode: 'dot',
    },
  },

  groupLinkOptions: {
    route: 'hosts',
    options: {
      mode: 'grouped',
    },
  },

  headers: [
    {
      name: 'stateSort',
      searchField: 'displayState',
      sort: ['stateSort','displayName'],
      translationKey: 'hostsPage.index.table.state',
      width: '120px'
    },
    {
      name: 'name',
      sort: ['displayName','id'],
      searchField: 'displayName',
      translationKey: 'hostsPage.index.table.name',
    },
    {
      name: 'ip',
      sort: ['displayIp','displayName'],
      searchField: 'displayIp',
      width: '130px',
      translationKey: 'hostsPage.index.table.ip',
    },
    {
      name: 'memory',
      sort: ['memory','displayName'],
      searchField: 'memoryBlurb',
      width: '80px',
      icon: 'icon icon-lg icon-memory',
    },
    {
      name: 'docker',
      sort: ['dockerEngineVersion','displayName'],
      searchField: 'dockerEngineVersion',
      width: '75px',
      icon: 'icon icon-lg icon-docker',
    },
    {
      name: 'instanceCount',
      sort: ['instances.length:desc','displayName'],
      searchField: null,
      width: '50px',
      icon: 'icon icon-lg icon-container',
    },
    {
      name: 'instanceState',
      sort: ['instanceCountSort:desc','displayName'],
      searchField: null,
      width: '150px',
      translationKey: 'hostsPage.index.table.instanceState',
    },
    {
      isActions: true,
      width: '30px',
    },
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
