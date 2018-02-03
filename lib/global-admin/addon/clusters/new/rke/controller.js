import Controller from '@ember/controller';
import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
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
    name: 'etcd',
    sort: false,
    searchField: null,
    translationKey: 'clustersPage.addPage.rke.new.headers.labels.etcd',
    classNames: ['text-center'],
  },
  {
    name: 'controlplane',
    sort: false,
    searchField: null,
    translationKey: 'clustersPage.addPage.rke.new.headers.labels.control',
    classNames: ['text-center'],
  },
  {
    name: 'worker',
    sort: false,
    searchField: null,
    translationKey: 'clustersPage.addPage.rke.new.headers.labels.worker',
    scope: 'embedded',
    classNames: ['text-center'],
  },
];

const workerHeaders = headersAll.filter((x) => x.scope === 'embedded');

const NETWORK = [
  { label: 'clustersPage.addPage.rke.new.network.flannel', value: 'flannel' },
  { label: 'clustersPage.addPage.rke.new.network.calico', value: 'calico' },
  { label: 'clustersPage.addPage.rke.new.network.canal', value: 'canal' },
];
const AUTH = [
  { label: 'clustersPage.addPage.rke.new.auth.x509', value: 'x509' },
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
  createNodes:     true,
  registry:        'default',

  init() {
    this._super(...arguments);
    setProperties(this, {
      loading: false,
      canSave: true,
      scope: 'dedicated',
    });
  },

  isDedicated: equal('scope', 'dedicated'),

  filteredMachines: computed('model.cluster.nodes.@each.{id,state}', function () {
    return (get(this, 'model.cluster.nodes') || []);
  }),

  etcdSafe: computed('model.cluster.nodes.@each.role', function () {
    const count = (get(this, 'model.cluster.nodes')||[])
      .filter((x) => (get(x,'role')||[])
      .includes('etcd'))
      .length;

    return count === 1 || count === 3 || count === 5;
  }),

  cpSafe: computed('model.cluster.nodes.@each.role', function () {
    const count = (get(this, 'model.cluster.nodes')||[])
      .filter((x) => (get(x,'role')||[])
      .includes('controlplane'))
      .length;

    return count >= 1;
  }),

  workerSafe: computed('model.cluster.nodes.@each.role', function () {
    const count = (get(this, 'model.cluster.nodes')||[])
      .filter((x) => (get(x,'role')||[])
      .includes('worker'))
      .length;

    return count >= 1;
  }),

  scopeChanged: observer('scope', function () {
    let config = get(this, 'config');
    set(config, 'nodes', []);
  }),

  actions: {
    addHost() {
      get(this, 'modal').toggleModal('modal-add-node', {
        templates: get(this, 'model.machineTemplates'),
        nodes: get(this, 'model.nodes'),
        drivers: get(this, 'model.machineDrivers'),
        cluster: get(this, 'model.cluster'),
      });
    },

    cancel() {
      this.send('goToPrevious', 'global-admin.clusters');
    },

    addRole(host, type) {
      if (get(host, 'role')) {
        let roles = get(host, 'role').slice();

        if (roles.includes(type)) {
          set(host, 'role', roles.without(type));
        } else {
          roles.pushObject(type);
          // wont notify of change with out this
          set(host, 'role', roles);
        }
      } else {
        set(host, 'role', [type]);
      }
    }
  },

  willSave() {
    const createNodes = get(this, 'createNodes');

    if ( !createNodes ) {
      set(this, 'model.cluster.nodes', []);
    }

    this._super(...arguments);

    const errors = get(this, 'errors')||[];
    const intl = get(this, 'intl');

    if ( createNodes) {
      if ( !get(this, 'etcdSafe') ) {
        errors.push(intl.t('clustersPage.addPage.rke.errors.etcd'));
      }

      if ( !get(this, 'cpSafe') ) {
        errors.push(intl.t('clustersPage.addPage.rke.errors.management'));
      }

      if ( !get(this, 'workerSafe') ) {
        errors.push(intl.t('clustersPage.addPage.rke.errors.node'));
      }
    }

    set(this, 'errors', errors);
    return errors.length === 0;
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
