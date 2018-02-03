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
  {
    name: 'remove',
    sort: false,
    width: 50,
    classNames: ['text-center'],
  }
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


function _addRoleTo(roleName, nodes, limit) {
  let node;
  let added = 0;
  if ( limit === undefined || limit > nodes.length ) {
    limit = nodes.length;
  }

  for ( let i = 0 ; i < limit ; i++ ) {
    node = nodes[i];
    const roles = get(node,'role');

    if ( roles ) {
      roles.addObject(roleName);
      node.notifyPropertyChange('role');
    } else {
      set(node, 'role', [roleName]);
    }

    added++;
  }

  return added;
}

function _nodesWith(nodes, /*role, [...role]*/) {
  return nodes.filter((node) => {
    const have = get(node,'role')||[];
    for ( let i = 1 ; i < arguments.length ; i++ ) {
      let test = arguments[i];
      if ( test && !have.includes(test) ) {
        return false;
      }
    }

    return true;
  });
}

function _nodesWithout(nodes, /*role, [...role]*/) {
  return nodes.filter((node) => {
    const have = get(node,'role')||[];
    for ( let i = 1 ; i < arguments.length ; i++ ) {
      let test = arguments[i];
      if ( test && have.includes(test) ) {
        return false;
      }
    }

    return true;
  });
}

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
  versionChoices:  [],
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

  etcdCount: computed('model.cluster.nodes.@each.role', function () {
    return (get(this, 'model.cluster.nodes')||[])
      .filter((x) => (get(x,'role')||[])
      .includes('etcd'))
      .length;
  }),

  etcdSafe: computed('etcdCount', function () {
    const count = get(this, 'etcdCount');
    return count === 1 || count === 3 || count === 5;
  }),

  cpCount: computed('model.cluster.nodes.@each.role', function () {
    return (get(this, 'model.cluster.nodes')||[])
      .filter((x) => (get(x,'role')||[])
      .includes('controlplane'))
      .length;
  }),

  cpSafe: computed('cpCount', function () {
    const count = get(this, 'cpCount');
    return count >= 1;
  }),

  workerCount: computed('model.cluster.nodes.@each.role', function () {
    return (get(this, 'model.cluster.nodes')||[])
      .filter((x) => (get(x,'role')||[])
      .includes('worker'))
      .length;
  }),

  workerSafe: computed('workerCount', function () {
    const count = get(this,'workerCount');
    return count >= 1;
  }),

  scopeChanged: observer('scope', function () {
    let config = get(this, 'config');
    set(config, 'nodes', []);
  }),

  actions: {
    addNode() {
      get(this, 'modal').toggleModal('modal-add-node', {
        templates: get(this, 'model.machineTemplates'),
        nodes: get(this, 'model.nodes'),
        drivers: get(this, 'model.machineDrivers'),
        cluster: get(this, 'model.cluster'),
      });
    },

    removeNode(node) {
      const nodes = get(this, 'model.cluster.nodes');
      nodes.removeObject(node);
    },

    pickRoles() {
      const nodes = get(this, 'model.cluster.nodes');
      const numNodes = get(nodes, 'length');
      let haveEtcd = get(this,'etcdCount');
      let haveCp = get(this,'cpCount');
      let haveWorker = get(this,'workerCount');

      let wantEtcd=3
      let wantCp=3
      let workerWithControl = false;

      if ( numNodes === 0 ) {
        return;
      } else if ( numNodes <= 2 ) {
        wantEtcd=1;
        wantCp=1;
        workerWithControl=true;
      } else if ( numNodes <= 5 ) {
        wantEtcd=3;
        wantCp=3;
        workerWithControl=true;
      }

      let available, preferred;
      if ( haveEtcd < wantEtcd ) {
        // Avoid workers if requested
        available = _nodesWithout(nodes, 'etcd');
        preferred = (workerWithControl ? available : _nodesWithout(available, 'worker'));
        haveEtcd += _addRoleTo('etcd', preferred, wantEtcd-haveEtcd);
        haveEtcd += _addRoleTo('etcd', available, wantEtcd-haveEtcd);
      }

      if ( haveCp < wantCp ) {
        available = _nodesWithout(nodes, 'controlplane');
        preferred = _nodesWith(nodes, 'etcd');
        haveCp += _addRoleTo('controlplane', preferred, wantCp-haveCp);

        preferred = _nodesWithout(available,'worker');
        haveCp += _addRoleTo('controlplane', preferred, wantCp-haveCp);

        haveCp += _addRoleTo('controlplane', available, wantCp-haveCp);
      }

      available = _nodesWithout(nodes, 'worker');
      if ( workerWithControl ) {
        haveWorker += _addRoleTo('worker', available);
      } else {
        preferred = _nodesWithout(available, 'etcd', 'controlplane');
        haveWorker += _addRoleTo('worker', preferred);
      }

      // In case there's no workers after !workerWithControl
      if ( !haveWorker ) {
        haveWorker += _addRoleTo('worker', available);
      }
    },

    cancel() {
      this.send('goToPrevious', 'global-admin.clusters');
    },

    toggleRole(node, type) {
      if (get(node, 'role')) {
        let roles = get(node, 'role').slice();

        if (roles.includes(type)) {
          set(node, 'role', roles.without(type));
        } else {
          roles.pushObject(type);
          // wont notify of change with out this
          node.notifyPropertyChange('role');
        }
      } else {
        set(node, 'role', [type]);
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
