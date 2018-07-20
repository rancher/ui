import { get, set, observer } from '@ember/object'
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  editing: null,
  hosts:   null,

  hostArray: null,

  init() {
    this._super(...arguments);
    this.initHosts();
  },

  didInsertElement() {
    if (get(this, 'editing') && get(this, 'hostArray.length') === 0) {
      this.send('addHost');
    }
  },

  actions: {
    removeHost(host) {
      get(this, 'hostArray').removeObject(host);
    },

    addHost() {
      get(this, 'hostArray').pushObject({ value: '', });
    },
  },

  hostDidChange: observer('hostArray.@each.value', function() {
    const hosts = [];

    get(this, 'hostArray').filter((host) => host.value).forEach((host) => {
      hosts.push(host.value);
    });
    set(this, 'hosts', hosts)
  }),
  initHosts() {
    const hosts = get(this, 'hosts') || [];

    set(this, 'hostArray', hosts.map((host) => {
      return { value: host, };
    }));
  },

});
