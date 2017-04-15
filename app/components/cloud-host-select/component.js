import Ember from 'ember';

const DEFAULT_REALM = 'us-west';
const PROVIDERS     = [{id: 'All'}, {id: 'Amazon'}, {id: 'Digital Ocean' }, {id: 'Packet' }];

export default Ember.Component.extend({
  prefs:        Ember.inject.service(),
  from:         null,
  tab:          Ember.computed.alias('from'),
  realmSort:    DEFAULT_REALM,
  providers:    PROVIDERS,
  memSort:      null,
  storageSort:  null,
  costSort:     null,
  providerSort: 'All',
  sortBy:       'price',
  actions:     {
    sendTab(id) {
      this.get('triggerTabChange')(id);
    },
    selectMachine(id) {
      this.setProperties({
        providerSort: 'All',
        memSort:      null,
        storageSort:  null,
        costSort:     null,
        realmSort:    DEFAULT_REALM,
      });
      this.get('triggerSelectMachine')(id);
    },
    favoriteChanged(id) {
      if (this.get('tab') === 'favorites') {
        this.set('model.plans', this.get('model.plans').filter((item) => {
          if (item.id !== id) {
            return true;
          }
          return false;
        }));
      }
    }
  },
  noDataMessage: Ember.computed('tab', function() {
    if (this.get('tab') === 'favorites') {
      return 'hostsPage.cloudHostsPage.browsePage.table.noFavs';
    }

    return 'hostsPage.cloudHostsPage.browsePage.table.noData';
  }),
  headers: [
    {
      name: 'favorite',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.favorite',
      width: '100'
    },
    {
      name: 'provider',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.provider',
      sort: ['provider', 'pricePerMonth', 'id'],
      width: '175'
    },
    {
      name: 'zone',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.zone',
      sort: ['zone', 'provider', 'id'],
    },
    {
      name: 'displayName',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.instance',
      sort: ['displayName', 'pricePerMonth', 'id'],
    },
    {
      name: 'memory',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.memory',
      sort: ['memory', 'pricePerMonth','displayName'],
    },
    {
      name: 'transfer',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.transfer',
      sort: ['transfer'],
    },
    // {
    //   name: 'cpuRating',
    //   translationKey: 'hostsPage.cloudHostsPage.browsePage.table.cpu',
    //   sort: ['cpuRating:desc','displayName'],
    //   width: 120,
    // },
    // {
    //   name: 'diskRating',
    //   translationKey: 'hostsPage.cloudHostsPage.browsePage.table.disk',
    //   sort: ['diskRating','displayName','zome'],
    //   width: 120
    // },
    {
      name: 'price',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.price',
      sort: ['pricePerMonth','memory:desc','displayName'],
      width: 75,
    },

    {
      width: 100,
    },
  ],

  providerContent: Ember.computed('model.plans', 'providerSort', function() {
    var content = this.get('model.plans');
    var prov = this.get('providerSort');

    if (prov !== 'All') {
      content = content.filterBy('provider', this.get('providerSort'))
    }

    return content;
  }),

  filteredContent: Ember.computed('providerContent', 'realmSort', 'costSort', 'storageSort', 'memSort', function() {
    var rs = this.get('realmSort');
    var cs = this.get('costSort');
    var ms = this.get('memSort');
    var ss = this.get('storageSort');

    if (rs === 'all') {
      return this.get('providerContent');
    } else {
      return this.get('providerContent').filter((plan) => {
        return (
          (!rs || plan.realm === rs) &&
          (!ms || plan.memory >= ms) &&
          (!ss || plan.storage >= ss) &&
          (!cs || plan.pricePerMonth <= cs)
        );
      });
    }
  }),
});
