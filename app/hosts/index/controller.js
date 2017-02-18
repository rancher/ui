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
      width: '160px'
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
      name: 'docker',
      sort: ['dockerEngineVersion','displayName'],
      searchField: 'dockerEngineVersion',
      width: '110px',
      translationKey: 'hostsPage.index.table.docker',
    },
    {
      name: 'good',
      sort: ['instanceGoodCount','displayName'],
      searchField: null,
      width: '60px',
      icon: 'icon icon-circle text-success',
    },
    {
      name: 'other',
      sort: ['instanceOtherCount','displayName'],
      searchField: null,
      width: '60px',
      icon: 'icon icon-circle text-warning',
    },
    {
      name: 'bad',
      sort: ['instanceBadCount','displayName'],
      searchField: null,
      width: '60px',
      icon: 'icon icon-circle text-error',
    },
    {
      isActions: true,
      width: '40px',
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
