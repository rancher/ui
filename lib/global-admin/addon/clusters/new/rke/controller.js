import Controller from '@ember/controller';
// import { copy } from '@ember/object/internals';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { computed,observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import EmberObject from '@ember/object';

const RKECONFIGHOST_DEFAULT = {
  advertisedHostname: '',
  role: null,
  type: 'rkeConfigHost',
  user: '',
  ssh: '',
};

const headersAll = [
  {
    name: 'state',
    sort: ['sortState','displayName'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    scope: 'embedded',
    width: 120,
  },
  {
    name: 'name',
    sort: ['displayName','id'],
    searchField: 'displayName',
    translationKey: 'generic.name',
    scope: 'embedded',
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
  {label: 'clustersPage.addPage.rke.new.options.network.flannel', value: 'flannel'},
  {label: 'clustersPage.addPage.rke.new.options.network.calico', value: 'calico'},
  {label: 'clustersPage.addPage.rke.new.options.network.canal', value: 'canal'},
];
const AUTH = [
  {label: 'clustersPage.addPage.rke.new.options.auth.x509', value: 'x509'},
];

export default Controller.extend(NewOrEdit, {
  modal:           service('modal'),
  clusterStore:    service('cluster-store'),
  loading:         null,
  newHost:         null,
  canSave:         null,
  primaryResource: alias('model.cluster'),
  config:          alias('primaryResource.rancherKubernetesEngineConfig'),
  scope:           null,
  headersAll:      headersAll,
  workerHeaders:   workerHeaders,
  sortBy:          'name',
  searchText:      '',
  authChoices:     AUTH,
  networkChoices:  NETWORK,
  countMap: null,

  init() {
    this._super(...arguments);
    this.setProperties({
      loading:         false,
      canSave:         true,
      scope:           'dedicated',
      countMap: {
        etcd: 0,
        controlplane: 0,
        worker: 0,
      }
    });
  },

  etcdSafe: computed('countMap.etcd', function() {
    const count = get(this, 'countMap.etcd');
    return count === 1 || count === 3 || count === 5;
  }),

  cpSafe: computed('countMap.controlplane', function() {
    return get(this, 'countMap.controlplane') >= 1;
  }),

  workerSafe: computed('countMap.worker', function() {
    return get(this, 'countMap.worker') >= 1;
  }),

  countState: observer('config.hosts.[]', function() {
    let hosts = (get(this, 'config.hosts') || []);
    let countMap = {
      etcd: 0,
      controlplane: 0,
      worker: 0,
    };

    hosts.forEach((host) => {
      get(host, 'role').forEach((role) => {
        countMap[role]++;
      });
    });
    set(this, 'countMap', countMap);
  }),

  scopeChanged: observer('scope', function() {
    let config = get(this, 'config');
    set(config, 'hosts', []);
  }),

  actions: {
    addHost() {
      get(this, 'modal').toggleModal('modal-add-cluster', {
        templates: get(this, 'model.hostTemplates'),
        hosts: get(this, 'model.hosts'),
        drivers: get(this, 'model.machineDrivers'),
      });
    },
    save() {
      debugger;
    },
    cancel(prev) {
      this.send('goToPrevious',prev);
    },
    addRole(host, type) {
      let clusterStore = get(this, 'clusterStore');
      let neu = EmberObject.create(RKECONFIGHOST_DEFAULT);
      let config = get(this, 'config');
      let hosts = ( get(config, 'hosts') || [] ).slice();
      let match = hosts.findBy('advertisedHostname', get(host, 'displayName'))
      if (match) {
        let roles = get(match, 'role');
        // exists now check roles
        if (roles.includes(type)) {
          // remove
          roles.removeObject(type);
          //last one? remove that as well
          if (roles.length === 0) {
            hosts.removeObject(match);
          }
        } else {
          //add new role
          roles.addObject(type);
        }
      } else {
        neu.setProperties({
          advertisedHostname: get(host, 'displayName'),
          role: [type],
          type: 'rkeConfigHost',
          user: 'root',
          ssh: '123',
        });
        neu = clusterStore.createRecord(neu);
        hosts.addObject(neu);
      }
      set(config, 'hosts', hosts); //so the countState observer updates
    }
  }
});
