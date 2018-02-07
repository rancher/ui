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
  inModal: null,

  customConfig: alias('primaryResource.customConfig'),

  tokens: null,
  token: null,
  machines: null,
  initialMachineCounts: null,
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

    if ( get(this,'inModal') ) {
      set(this, 'mode', 'ssh');
    }

    set(this, 'role', []);

    set(this, 'tokens', globalStore.all('clusterRegistrationToken'));
    globalStore.find('clusterRegistrationToken').then(() => {
      let clusterId = get(this, 'requestedClusterId');
      if ( clusterId ) {
        this.clusterChanged();
      } else {
        clusterId = get(globalStore.all('cluster'),'firstObject.id');
        set(this, 'requestedClusterId', clusterId);
      }
    });

    const counts = {};
    set(this, 'machines', globalStore.all('machine'));
    globalStore.findAll('machine').then((all) => {
      all.forEach((machine) => {
        const id = get(machine,'clusterId');
        counts[id] = (counts[id]||0) + 1;
      });
    });

    set(this, 'initialMachineCounts', counts);
  },

  newMachineCount: computed('initialMachineCounts','cluster.id','machines.@each.clusterId', function() {
    let clusterId = get(this,'requestedClusterId');
    let orig = get(this, 'initialMachineCounts')[clusterId] || 0;
    let cur = get(this, 'machines').filterBy('clusterId', clusterId).length

    if ( cur < orig ) {
      orig = cur;
      set (get(this,'initialMachineCounts'), clusterId, cur)
    }

    return cur - orig;
  }),

  command: computed(`settings.${C.SETTING.AGENT_IMAGE}`, 'labels', 'token.token', 'role.[]', function() {
    const image = get(this,`settings.${C.SETTING.AGENT_IMAGE}`);
    const cacerts = get(this,`settings.${C.SETTING.CA_CERTS}`);
    const checksum = AWS.util.crypto.sha256(cacerts+'\n','hex');
    const url = window.location.origin;
    const token = get(this,'token.token');
    const role = get(this,'role')||[];

    let roleFlags='';
    if ( role.length ) {
      roleFlags = ' --' + role.join(' --');
    }

    let out = `docker run -d --restart=unless-stopped -v /var/run/docker.sock:/var/run/docker.sock --net=host ${image}${roleFlags} --server ${url} --token ${token} --ca-checksum ${checksum}`;

    const labels = get(this, 'labels')||{};
    Object.keys(labels).forEach((key) => {
      out += ` --label ${key}=${labels[key]}`;
    });

    return out;
  }),

  clusterChanged: observer('requestedClusterId', function() {
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
      type: (get(this, 'inModal') ? 'machineConfig' : 'machine'),
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

//  didSave(model) {
//    return [model];
//  }
});
