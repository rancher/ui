import Controller from '@ember/controller';
// import { copy } from '@ember/object/internals';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
// import { computed,observer } from '@ember/object';
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
  },
  {
    name: 'name',
    sort: ['displayName','id'],
    searchField: 'displayName',
    translationKey: 'generic.name',
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
  },
];

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
  store:           service('cluster-store'),
  loading:         null,
  newHost:         null,
  canSave:         null,
  primaryResource: alias('model.cluster'),
  config:          alias('primaryResource.rancherKubernetesEngineConfig'),
  scope:           null,
  headers:         headersAll,
  sortBy:          'name',
  searchText:      '',
  hasEtcd:         null,
  hasControlPlane: null,
  hasWorkers:      null,
  authChoices:     AUTH,
  networkChoices:  NETWORK,

  init() {
    this._super(...arguments);
    this.setProperties({
      loading:         false,
      canSave:         false,
      scope:           'dedicated',
      hasEtcd:         false,
      hasControlPlane: false,
      hasWorkers:      false,
    });
  },

  actions: {
    addHost() {
      get(this, 'modal').toggleModal('modal-add-cluster', {
        templates: get(this, 'model.hostTemplates'),
        hosts: get(this, 'model.hosts')
      });
    },
    save() {
      debugger;
    },
    cancel(prev) {
      this.send('goToPrevious',prev);
    },
    addRole(host, type) {
      let store = get(this, 'store');
      let neu = EmberObject.create(RKECONFIGHOST_DEFAULT);
      let config = get(this, 'config');
      let hosts = get(config, 'hosts') || [];
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
        neu = store.createRecord(neu);
        hosts.addObject(neu);
      }
    }
  }
});
