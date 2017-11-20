import Controller from '@ember/controller';
import { copy } from '@ember/object/internals';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';

export default Controller.extend({
  modalService: service('modal'),
  step:        null,
  loading:     null,
  newHost:     null,
  newOrReuse:  null,
  clusterList: null,
  managementList: null,
  nodesList: null,
  canAdd: null,

  init() {
    this._super(...arguments);
    let newHost = {
      clusterName: '',
      hostName: '',
      ssh: '',
    }
    this.setProperties({
      step: 1,
      newHost: newHost,
      loading: false,
      canAdd: false,
      newOrReuse: 'new',
      clusterList: [],
      managementList: [],
      nodesList: [],
    });
  },

  hostObserver: observer('newHost.clusterName','newHost.hostName','newHost.ssh', function() {
    let cName = get(this, 'newHost.clusterName');
    let hName = get(this, 'newHost.hostName');
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
      let newHost = {
        clusterName: '',
        hostName: '',
        ssh: '',
      }
      this.get('modalService').toggleModal('modal-add-cluster', {
        newHost: newHost,
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
      get(this, 'clusterList').pushObject(get(this, 'newHost'));
      set(this, 'newHost', {
        clusterName: '',
        hostName: '',
        ssh: '',
      });
    },
    removeHost(host, list) {
      get(this, list).removeObject(host);
    },
    useFor(host, list) {
      get(this, list).pushObject(host);
    },
  }
});
