import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { getOwner } from '@ember/application';

const headers = [
  {
    name:           'state',
    sort:           ['sortState','name','id'],
    translationKey: 'generic.state',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['displayName','id'],
    translationKey: 'clustersPage.cluster.label',
  },
  {
    name:           'provider',
    sort:           ['displayProvider','name','id'],
    translationKey: 'clustersPage.provider.label',
    width: 150,
  },
  {
    name:           'nodes',
    sort:           ['nodes.length','name','id'],
    translationKey: 'clustersPage.nodes.label',
    width: 100,
  },
  {
    name:           'cpu',
    sort:           ['cpuUsage','name'],
    translationKey: 'clustersPage.cpu.label',
    width: 100,
  },
  {
    name:           'memory',
    sort:           ['memoryUsage','name'],
    translationKey: 'clustersPage.memory.label',
    width: 125,
  }
];

export default Controller.extend({
  queryParams: ['mode'],
  mode: 'grouped',

  modalService: service('modal'),
  access: service(),
  scope: service(),
  settings: service(),
  application: controller(),

  headers: headers,
  extraSearchFields: ['version.gitVersion'],
  sortBy: 'name',
  searchText: null,
  bulkActions: true,

  actions: {
    launchOnCluster(model) {
      let authenticated = getOwner(this).lookup('route:authenticated');
      if (this.get('scope.currentProject.id') === model.get('defaultProject.id')) {
        this.transitionToRoute('authenticated.host-templates', {queryParams: {clusterId: model.get('id'), backTo: 'clusters'}});
      } else {
        authenticated.send('switchProject', model.get("defaultProject.id"), 'authenticated.host-templates', [model.id, {queryParams: {backTo: 'clusters'}}]);
      }
    },
    useKubernetes(model) {
      let authenticated = getOwner(this).lookup('route:authenticated');
      authenticated.send('switchProject', model.get("defaultProject.id"), 'authenticated.cluster.import', [model.id, {queryParams: {backTo: 'clusters'}}]);
    },
  },
});
