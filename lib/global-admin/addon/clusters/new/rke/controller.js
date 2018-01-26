import Controller from '@ember/controller';
import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import ACC from 'shared/mixins/alert-child-component';

const M_CONFIG = {
  type: 'clusterRoleTemplateBinding',
  clusterId: '',
  name: '',
  subjectKind: '',
  userId: '',
  roleTemplateId: '',
};

const headersAll = [
  {
    name: 'state',
    sort: ['sortState', 'displayName'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    scope: 'embedded',
    width: 120,
  },
  {
    name: 'name',
    sort: ['displayName', 'id'],
    searchField: 'displayName',
    translationKey: 'generic.name',
    scope: 'embedded',
  },
  {
    name: 'all',
    sort: false,
    searchField: null,
    translationKey: 'clustersPage.addPage.rke.new.headers.labels.all',
  },
  {
    name: 'etcd',
    sort: false,
    searchField: null,
    translationKey: 'clustersPage.addPage.rke.new.headers.labels.etcd',
  },
  {
    name: 'controlplane',
    sort: false,
    searchField: null,
    translationKey: 'clustersPage.addPage.rke.new.headers.labels.control',
  },
  {
    name: 'worker',
    sort: false,
    searchField: null,
    translationKey: 'clustersPage.addPage.rke.new.headers.labels.worker',
    scope: 'embedded',
  },
];

const workerHeaders = headersAll.filter((x) => x.scope === 'embedded');

const NETWORK = [
  { label: 'clustersPage.addPage.rke.new.options.network.flannel', value: 'flannel' },
  { label: 'clustersPage.addPage.rke.new.options.network.calico', value: 'calico' },
  { label: 'clustersPage.addPage.rke.new.options.network.canal', value: 'canal' },
];
const AUTH = [
  { label: 'clustersPage.addPage.rke.new.options.auth.x509', value: 'x509' },
];

export default Controller.extend(ACC, {
  modal:           service('modal'),
  intl:            service(),
  globalStore:     service(),
  loading:         null,
  newHost:         null,
  canSave:         null,
  primaryResource: alias('model.cluster'),
  memberArray:     alias('model.cluster.clusterRoleTemplateBindings'),
  config:          alias('primaryResource.rancherKubernetesEngineConfig'),
  secPolicy:       alias('primaryResource.defaultPodSecurityPolicyTemplateId'),
  memberConfig:    M_CONFIG,
  scope:           null,
  headersAll:      headersAll,
  workerHeaders:   workerHeaders,
  sortBy:          'name',
  searchText:      '',
  authChoices:     AUTH,
  networkChoices:  NETWORK,
  countMap:        null,

  init() {
    this._super(...arguments);
    setProperties(this, {
      loading: false,
      canSave: true,
      scope: 'dedicated',
      countMap: {
        etcd: 0,
        controlplane: 0,
        worker: 0,
      },
    });
  },

  filteredMachines: computed('model.cluster.nodes.@each.{id,state}', function () {
    return (get(this, 'model.cluster.nodes') || []);
  }),

  etcdSafe: computed('countMap.etcd', function () {
    const count = get(this, 'countMap.etcd');
    return count === 1 || count === 3 || count === 5;
  }),

  cpSafe: computed('countMap.controlplane', function () {
    return get(this, 'countMap.controlplane') >= 1;
  }),

  workerSafe: computed('countMap.worker', function () {
    return get(this, 'countMap.worker') >= 1;
  }),

  countState: observer('model.cluster.nodes.@each.{role}', function () {
    let nodes = (get(this, 'model.cluster.nodes') || []);
    let countMap = {
      etcd: 0,
      controlplane: 0,
      worker: 0,
    };

    nodes.forEach((host) => {
      (get(host, 'role') || []).forEach((role) => {
        countMap[role]++;
      });
    });
    set(this, 'countMap', countMap);
  }),

  scopeChanged: observer('scope', function () {
    let config = get(this, 'config');
    set(config, 'nodes', []);
  }),

  actions: {
    addHost() {
      get(this, 'modal').toggleModal('modal-add-cluster', {
        templates: get(this, 'model.machineTemplates'),
        nodes: get(this, 'model.nodes'),
        drivers: get(this, 'model.machineDrivers'),
        cluster: get(this, 'model.cluster'),
      });
    },
    cancel() {
      this.send('goToPrevious', 'global-admin.clusters');
    },
    selectAllRoles(host) {
      const roles = get(host, 'role')
      if (roles && roles.length === 3) {
        set(host, 'role', []);
      } else {
        set(host, 'role', ['etcd', 'controlplane', 'worker']);
      }
    },
    addRole(host, type) {
      if (get(host, 'role')) {
        let roles = get(host, 'role').slice();

        if (roles.includes(type)) {
          set(host, 'role', roles.without(type));
        } else {
          roles.pushObject(type);
          // wont notify countState with out this
          set(host, 'role', roles);
        }
      } else {
        set(host, 'role', [type]);
      }
    }
  },

  didSave() {
    const pr = get(this, 'primaryResource');
    return pr.waitForCondition('BackingNamespaceCreated').then(() => {
      return this.alertChildDidSave().then(() => {
        return pr;
      });
    });
  },

  doneSaving() {
    this.transitionToRoute('clusters.index');
  },
});
