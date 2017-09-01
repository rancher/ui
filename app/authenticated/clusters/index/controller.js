import Ember from 'ember';

const headers = [
  {
    name: 'expand',
    sort: false,
    searchField: null,
    width: 30
  },
  {
    name:           'state',
    sort:           ['stateSort','name','id'],
    translationKey: 'generic.state',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['displayName','id'],
    translationKey: 'clustersPage.cluster.label',
  },
  {
    name:           'hosts',
    sort:           ['numHosts','name','id'],
    translationKey: 'clustersPage.hosts.label',
    width: 100,
    classNames: 'text-center',
  },
  {
    name:           'cpu',
    sort:           ['numGhz','name','id'],
    translationKey: 'clustersPage.cpu.label',
    width: 100,
    classNames: 'text-center',
  },
  {
    name:           'memory',
    sort:           ['numMem','name','id'],
    translationKey: 'clustersPage.memory.label',
    width: 100,
    classNames: 'text-center',
  },
  {
    name:           'storage',
    sort:           ['numStorage','name','id'],
    translationKey: 'clustersPage.storage.label',
    width: 100,
    classNames: 'text-center',
  },
];

export default Ember.Controller.extend({
  queryParams: ['mode'],
  mode: 'grouped',

  modalService: Ember.inject.service('modal'),
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  application: Ember.inject.controller(),

  headers: headers,
  sortBy: 'name',
  searchText: null,
  bulkActions: true,

  init() {
    this._super(...arguments);
    this.set('expandedClusters',[]);
  },

  actions: {
    toggleExpand(id) {
      let list = this.get('expandedClusters');
      if ( list.includes(id) ) {
        list.removeObject(id);
      } else {
        list.addObject(id);
      }
    },
  },
});
