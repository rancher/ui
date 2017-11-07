import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { getOwner } from '@ember/application';

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

export default Controller.extend({
  queryParams: ['mode'],
  mode: 'grouped',

  modalService: service('modal'),
  access: service(),
  projects: service(),
  settings: service(),
  application: controller(),

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
    launchOnCluster(model) {
      let authenticated = getOwner(this).lookup('route:authenticated');
      if (this.get('projects.current.id') === model.get('defaultProject.id')) {
        this.transitionToRoute('authenticated.clusters.cluster.host-templates', model.get('id'), {queryParams: {backTo: 'clusters'}});
      } else {
        authenticated.send('switchProject', model.get("defaultProject.id"), 'authenticated.clusters.cluster.host-templates', [model.id, {queryParams: {backTo: 'clusters'}}]);
      }
    },
    useKubernetes(model) {
      let authenticated = getOwner(this).lookup('route:authenticated');
      authenticated.send('switchProject', model.get("defaultProject.id"), 'authenticated.clusters.cluster.import', [model.id, {queryParams: {backTo: 'clusters'}}]);
    },
  },
});
