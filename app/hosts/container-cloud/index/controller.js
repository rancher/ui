import Ember from 'ember';

const DEFAULT_REALM = 'us-west';

export default Ember.Controller.extend({
  queryParams: ['from'],
  from:        'browse',
  initialTab:  'browse',
  tab:         null,
  realmSort:   DEFAULT_REALM,
  memSort:     null,
  storageSort: null,
  costSort:    null,
  sortBy:      'price',
  actions:     {
    selectMachine(id) {
      this.transitionToRoute('hosts.container-cloud.add', id);
    }
  },
  headers: [
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
    {
      name: 'cpuRating',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.cpu',
      sort: ['cpuRating:desc','displayName'],
      width: 120,
    },
    {
      name: 'diskRating',
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.disk',
      sort: ['diskRating','displayName','zome'],
      width: 120
    },
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

  tabObserve: Ember.observer('tab', function() {
    this.transitionToRoute('hosts.container-cloud', {queryParams: {from: this.get('tab')}});
  }),

  filteredContent: Ember.computed('model.plans', 'realmSort', 'costSort', 'storageSort', 'memSort', function() {
    var rs = this.get('realmSort');
    var cs = this.get('costSort');
    var ms = this.get('memSort');
    var ss = this.get('storageSort');

    if (rs === 'all') {
      return this.get('model.plans');
    } else {
      return this.get('model.plans').filter((plan) => {
        return (
          (!rs || plan.realm === rs) &&
          (!ms || plan.memory >= ms) &&
          (!ss || plan.storage >= ss) && 
          (!cs || plan.pricePerMonth >= cs)
        );
      });
    }
  }),
});
