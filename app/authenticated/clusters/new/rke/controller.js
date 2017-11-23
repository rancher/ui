import Controller from '@ember/controller';
// import { copy } from '@ember/object/internals';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { computed,observer } from '@ember/object';
import { alias } from '@ember/object/computed';

const CONFIG_DEFAULT = {
  advertisedHostname: '',
  role: null,
  type: 'rkeConfigHost',
  user: '',
  ssh: '',
};

export default Controller.extend({
  modalService: service('modal'),
  store: service('cluster-store'),
  step:        null,
  loading:     null,
  newHost:     null,
  // clusterList: null,
  canAdd: null,
  cluster: alias('model'),
  config: alias('model.rancherKubernetesEngineConfig'),

  init() {
    this._super(...arguments);
    let newHostConfig = get(this, 'store').createRecord(CONFIG_DEFAULT);
    set(newHostConfig, 'role', ['etcd']);
    this.setProperties({
      step: 1,
      newHost: newHostConfig,
      loading: false,
      canAdd: false,
    });
  },

  workerList: computed('config.hosts.@each.{role,advertisedHostname,user}', function() {
    return ( get(this, 'config.hosts') || [] ).filter((host) => {
      return (get(host, 'role')||[]).includes('worker');
    });
  }),

  controlplaneList: computed('config.hosts.@each.{role,advertisedHostname,user}', function() {
    return ( get(this, 'config.hosts') || [] ).filter((host) => {
      return (get(host, 'role')||[]).includes('controlplane');
    });
  }),

  clusterList: computed('config.hosts.@each.{role,advertisedHostname,user,ssh}', function() {
    // unfilterd list of host
    return ( get(this, 'config.hosts') || [] ).uniq();
  }),

  hostObserver: observer('newHost.user','newHost.advertisedHostname','newHost.ssh', function() {
    let cName = get(this, 'newHost.user');
    let hName = get(this, 'newHost.advertisedHostname');
    let ssh = get(this, 'newHost.ssh');
    (cName.length > 0) && (hName.length > 0) && (ssh.length > 0) ? set(this, 'canAdd', true) : set(this, 'canAdd', false);
  }),

  actions: {
    save() {
    },
    cancel(prev) {
      this.send('goToPrevious',prev);
    },
    addNew(type) {
      // TODO - set role
      let neu = CONFIG_DEFAULT;
      set(neu, 'role', []);
      this.get('modalService').toggleModal('modal-add-cluster', {
        newHost: get(this, 'store').createRecord(neu),
        list: get(this, type),
      });
    },
    go() {
      this.incrementProperty('step');
    },
    back() {
      this.decrementProperty('step');
    },
    addHost() {
      get(this, 'config.hosts').pushObject(get(this, 'newHost'));
      set(this, 'newHost', get(this, 'store').createRecord(CONFIG_DEFAULT));
    },
    removeHost(host, roleToRemove) {
      let roles = get(host, 'role');
      let at = roles.indexOf(roleToRemove);
      if (at >= 0) {
        roles.removeAt(at);
        if (roles.length === 0) {
          get(this, 'config.hosts').removeObject(host);
        }
      }
    },
    useFor(host, role) {
      // set knows nothing changed so it will not fire the computed propertiy change events
      let roles = get(host, 'role').slice(); //clone the array
      roles.addObject(role);
      set(host, 'role', roles);
    },
  }
});
