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
  canAdd: null,
  cluster: alias('model'),
  config: alias('model.rancherKubernetesEngineConfig'),

  init() {
    this._super(...arguments);
    this.setProperties({
      step: 1,
      newHost: this.neuHostModel(),
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
    return ( get(this, 'config.hosts') || [] );
  }),

  hostObserver: observer('newHost.user','newHost.advertisedHostname','newHost.ssh', function() {
    let cName = get(this, 'newHost.user');
    let hName = get(this, 'newHost.advertisedHostname');
    let ssh = get(this, 'newHost.ssh');
    (cName.length > 0) && (hName.length > 0) && (ssh.length > 0) ? set(this, 'canAdd', true) : set(this, 'canAdd', false);
  }),

  currentRole: function() {
    let role = 'etcd';
    let step = get(this, 'step');
    switch(step) {
    case 1:
      role = 'etcd';
      break;
    case 2:
      role = 'controlplane';
      break;
    case 3:
      role = 'worker';
      break;
    default:
      break;
    }
    return role;
  },

  neuHostModel: function() {
    let newHostConfig = get(this, 'store').createRecord(CONFIG_DEFAULT);
    set(newHostConfig, 'role', [this.currentRole()]);
    return newHostConfig;
  },

  actions: {
    save() {
      get(this, 'cluster').save().then((resp) => {
        resp;
        debugger;
      }).catch((err) => {
        err;
        debugger;
      });
    },
    cancel(prev) {
      this.send('goToPrevious',prev);
    },
    addNew(type) {
      // TODO - set role
      this.get('modalService').toggleModal('modal-add-cluster', {
        newHost: get(this, 'store').createRecord(this.neuHostModel()),
        list: get(this, type),
        scope: this,
      });
    },
    go() {
      this.incrementProperty('step');
      set(this, 'newHost', this.neuHostModel());
    },
    back() {
      this.notifyPropertyChange('clusterList');
      this.decrementProperty('step');
      set(this, 'newHost', this.neuHostModel());
    },
    addHost() {
      get(this, 'config.hosts').addObject(get(this, 'newHost'));
      set(this, 'newHost', this.neuHostModel());
    },
    removeHost(host, roleToRemove) {
      let roles = get(host, 'role');
      let at = roles.indexOf(roleToRemove);
      if (at >= 0) {
        roles.removeAt(at);
        if (roles.length === 0) {
          get(this, 'config.hosts').removeObject(host);
          set(this, 'newHost', this.neuHostModel());
        }
      }
    },
    useFor(host, role) {
      // set knows nothing changed so it will not fire the computed propertiy change events
      let roles = get(host, 'role').slice(); //clone the array
      roles.addObject(role);
      set(host, 'role', roles);
      set(this, 'newHost', this.neuHostModel());
    },
  }
});
