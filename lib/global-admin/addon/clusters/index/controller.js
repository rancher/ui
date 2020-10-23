import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { getOwner } from '@ember/application';
import { computed, get, set } from '@ember/object';

const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'name', 'id'],
    translationKey: 'generic.state',
    width:          125,
  },
  {
    name:           'name',
    searchField:    'displayName',
    sort:           ['displayName', 'id'],
    translationKey: 'clustersPage.cluster.label',
  },
  {
    name:           'provider',
    searchField:    'displayProvider',
    sort:           ['displayProvider', 'name', 'id'],
    translationKey: 'clustersPage.provider.label',
    width:          150,
  },
  {
    name:           'nodes',
    searchField:    'nodes.length',
    sort:           ['nodes.length', 'name', 'id'],
    translationKey: 'clustersPage.nodes.label',
    width:          100,
  },
  {
    name:           'cpu',
    sort:           ['cpuUsage', 'name'],
    searchField:    'cpuUsage',
    translationKey: 'clustersPage.cpu.label',
    width:          100,
  },
  {
    name:           'memory',
    searchField:    'memoryUsage',
    sort:           ['memoryUsage', 'name'],
    translationKey: 'clustersPage.memory.label',
    width:          125,
  },
  {
    name:        'explorer',
    searchField: false,
    sort:        false,
    label:       '',
    width:       100,
  }
];

const NODE_SEARCH_FIELDS = ['displayName', 'externalIpAddress:ip', 'ipAddress:ip'];

export default Controller.extend({
  modalService:       service('modal'),
  access:             service(),
  scope:              service(),
  settings:           service(),
  prefs:              service(),
  router:             service(),
  globalStore:        service(),

  application:        controller(),
  queryParams:        ['mode'],
  mode:               'grouped',

  headers,
  extraSearchFields:  ['version.gitVersion'],
  sortBy:             'name',
  searchText:         null,
  bulkActions:        true,
  _allClusters:       null,

  extraSearchSubFields: NODE_SEARCH_FIELDS,

  init() {
    this._super(...arguments);

    set(this, '_allClusters', this.globalStore.all('cluster'));
  },

  actions: {
    launchOnCluster(model) {
      let authenticated = getOwner(this).lookup('route:authenticated');

      if (this.get('scope.currentProject.id') === model.get('defaultProject.id')) {
        this.transitionToRoute('authenticated.host-templates', {
          queryParams: {
            clusterId: model.get('id'),
            backTo:    'clusters'
          }
        });
      } else {
        authenticated.send('switchProject', model.get('defaultProject.id'), 'authenticated.host-templates', [model.id, { queryParams: { backTo: 'clusters' } }]);
      }
    },

    useKubernetes(model) {
      let authenticated = getOwner(this).lookup('route:authenticated');

      authenticated.send('switchProject', model.get('defaultProject.id'), 'authenticated.cluster.import', [model.id, { queryParams: { backTo: 'clusters' } }]);
    },
  },

  filteredClusters: computed('_allClusters.@each.{id,state,transitioning,transitioningMessage}', '_allClusters.[]', function() {
    const hideLocalCluster = get(this.settings, 'shouldHideLocalCluster');

    return get(this, '_allClusters').filter((cluster) => {
      if ((hideLocalCluster && get(cluster, 'id') !== 'local') || !hideLocalCluster) {
        return cluster;
      }
    });
  })

});
