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
  sortBy:      'provider',
  actions:     {
    selectMachine(id) {
      this.transitionToRoute('hosts.container-cloud.add', id);
    }
  },
  headers:     [
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.provider',
      name:           'provider',
      sort:           ['provider', 'id'],
      width:          '175'
    },
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.instance',
      name:           'displayName',
      sort:           ['displayName', 'id'],
    },
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.realm',
      name:           'availabilityRealm',
      sort:           ['realm', 'id'],
    },
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.storage',
      name:           'storage',
      sort:           ['storage', 'id',],
    },
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.transfer',
      name:           'transfer',
      sort:           ['transfer'],
    },
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.cpu',
      name:           'cpuRating',
      sort:           ['cpuRating'],
      width:          ''
    },
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.disk',
      name:           'diskRating',
      sort:           ['diskRating'],
      width:          ''
    },
    {
      translationKey: 'hostsPage.cloudHostsPage.browsePage.table.ppm',
      width:          '75',
    },
    {
      width:          '125',
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
        return ((!rs || plan.realm === rs) && (!ms || plan.memory >= ms) && (!ss || plan.storage >= ss) && (!cs || plan.pricePerMonth >= cs));
      });
    }
  }),
});
