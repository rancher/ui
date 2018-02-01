import { get, set, observer, computed } from '@ember/object';
import { alias } from '@ember/object/computed'
import layout from './template';
import Driver from 'shared/mixins/host-driver';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

export default Component.extend(Driver, {
  layout,
  globalStore: service(),
  model: null,

  mode: 'command',
  loading: true,

  customConfig: alias('primaryResource.customConfig'),

  tokens: null,
  token: null,
  nodes: null,
  initialNodeCounts: null,
  labels: null,
  role: null,

  actions: {
    setLabels(labels) {
      set(this, 'labels', labels);
      var out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('labels', out);
    }
  },

  init() {
    const globalStore = get(this, 'globalStore');
    this._super();

    set(this, 'tokens', globalStore.all('clusterRegistrationToken'));
    globalStore.find('clusterRegistrationToken').then(() => {
      this.clusterChanged();
    });

    const counts = {};
    set(this, 'nodes', globalStore.all('node'));
    globalStore.findAll('node').then((all) => {
      all.forEach((node) => {
        const id = get(node,'clusterId');
        counts[id] = (counts[id]||0) + 1;
      });
    });

    set(this, 'initialNodeCounts', counts);
  },

  newNodeCount: computed('initialNodeCounts','cluster.id','nodes.@each.clusterId', function() {
    let clusterId = get(this,'cluster.id');
    let orig = get(this, 'initialNodeCounts')[clusterId] || 0;
    let cur = get(this, 'nodes').filterBy('clusterId', clusterId).length

    if ( cur < orig ) {
      orig = cur;
      set (get(this,'initialNodeCounts'), clusterId, cur)
    }

    return cur - orig;
  }),

  command: computed(`settings.${C.SETTING.AGENT_IMAGE}`, 'labels', 'token.token', 'role.[]', function() {
    const image = get(this,`settings.${C.SETTING.AGENT_IMAGE}`);
    const cacerts = get(this,`settings.${C.SETTING.CA_CERTS}`);
    const checksum = AWS.util.crypto.sha256(cacerts,'hex');
    const url = window.location.origin;
    const token = get(this,'token.token');

    let out = `docker run ${image} --server ${url} --token ${token} --ca-checksum ${checksum}`;

    const labels = get(this, 'labels')||{};
    Object.keys(labels).forEach((key) => {
      out += ` --label ${key}=${labels[key]}`;
    });

    return out;
  }),

  clusterChanged: observer('cluster.id', function() {
    const clusterId = get(this, 'requestedClusterId');
    let token = get(this, 'tokens').filterBy('clusterId', clusterId)[0];
    if ( token ) {
      set(this, 'token', token);
      set(this, 'loading', false);
    } else {
      token = get(this, 'globalStore').createRecord({
        type: 'clusterRegistrationToken',
        clusterId: clusterId
      });

      set(this, 'token', token);
      set(this, 'loading', true);
      token.save().finally(() => {
        set(this, 'loading', false);
      });
    }
  }),


  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type: 'customConfig',
    });

    set(this, 'model', get(this, 'globalStore').createRecord({
      type: 'machineConfig',
      driver: 'custom',
      customConfig: config,
      state: 'to-import',
    }));
  },


  validate() {
    let errors = [];
    set(this, 'errors', errors);
    return true;
  },

  didSave(model) {
    return [model];
  }
});
