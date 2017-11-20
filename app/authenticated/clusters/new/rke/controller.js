import Controller from '@ember/controller';
import { copy } from '@ember/object/internals';
import { get, set } from '@ember/object';

export default Controller.extend({
  step:        null,
  loading:     null,
  newHost:     null,
  newOrReuse:  null,
  clusterList: null,
  managementList: null,
  nodesList: null,
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
      newOrReuse: 'new',
      clusterList: [],
      managementList: [],
      nodesList: [],
    });
  },
  actions: {
    cancel(prev) {
      this.send('goToPrevious',prev);
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
    addManagementHost() {},
  }
});
