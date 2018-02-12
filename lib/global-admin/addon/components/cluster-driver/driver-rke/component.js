import Component from '@ember/component'
import ClusterDriver from 'global-admin/mixins/cluster-driver';
import { equal } from '@ember/object/computed';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

const headers = [
  {
    name: 'name',
    sort: ['displayName', 'id'],
    searchField: 'displayName',
    translationKey: 'generic.name',
    scope: 'embedded',
  },
  {
    name: 'nodeTemplate',
    sort: ['nodeTemplate.displayName', 'nodeTemplate.id'],
    searchField: 'nodeTemplate.displayName',
    translationKey: 'clusterNew.rke.nodes.header',
  },
  {
    name: 'etcd',
    sort: false,
    searchField: null,
    translationKey: 'clusterNew.rke.role.header.etcd',
    classNames: ['text-center'],
  },
  {
    name: 'controlplane',
    sort: false,
    searchField: null,
    translationKey: 'clusterNew.rke.role.header.controlplane',
    classNames: ['text-center'],
  },
  {
    name: 'worker',
    sort: false,
    searchField: null,
    translationKey: 'clusterNew.rke.role.header.worker',
    scope: 'embedded',
    classNames: ['text-center'],
  },
  {
    name: 'remove',
    sort: false,
    classNames: ['text-center'],
    width: 50,
  }
];

export default Component.extend(ClusterDriver, {
  settings: service(),

  configField: 'rancherKubernetesEngineConfig',
  headers,

  registry: 'default',
  registryUrl: null,
  registryUser: null,
  registryPass: null,

  init() {
    this._super();

    const globalStore = get(this, 'globalStore');
    const counts = {};

    set(this, 'existingNodes', globalStore.all('node'));
    globalStore.findAll('node').then((all) => {
      all.forEach((node) => {
        const id = get(node,'clusterId');
        counts[id] = (counts[id]||0) + 1;
      });

      this.notifyPropertyChange('initialNodeCounts');
    });

    set(this, 'initialNodeCounts', counts);

    if ( ! get(this,'cluster.rancherKubernetesEngineConfig') ) {
      let config = globalStore.createRecord({
        type: 'rancherKubernetesEngineConfig',
        nodes: [],
      });
      set(this, 'cluster.rancherKubernetesEngineConfig', config);
    }
  },

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

  willSave() {
    if ( get(this, 'registry') === 'custom' ) {
      const registry = {
        url: get(this, 'registryUrl'),
        user: get(this, 'registryUser'),
        password: get(this, 'registryPass'),
      }

      set(this, 'config.privateRegistries', [registry]);
    }

    return this._super(...arguments);
  },

  doneSaving() {
    if ( get(this, 'isCustom') ){
      const cluster = get(this,'cluster');
      return cluster.getOrCreateToken().then((token) => {
        set(this, 'token', token);
        set(this, 'step', 2);
      });
    } else {
      return this._super(...arguments);
    }
  },

  // Custom stuff
  isCustom: equal('nodeWhich','custom'),
  existingNodes: null,
  initialNodeCounts: null,
  step: 1,
  token: null,
  labels: null,
  etcd: false,
  controlplane: false,
  worker: true,

  newNodeCount: computed('initialNodeCounts','cluster.id','existingNodes.@each.clusterId', function() {
    let clusterId = get(this,'requestedClusterId');
    let orig = get(this, 'initialNodeCounts')[clusterId] || 0;
    let cur = get(this, 'existingNodes').filterBy('clusterId', clusterId).length

    if ( cur < orig ) {
      orig = cur;
      set (get(this,'initialNodeCounts'), clusterId, cur)
    }

    return cur - orig;
  }),

  command: computed(`settings.${C.SETTING.AGENT_IMAGE}`, 'labels', 'token.token', 'etcd', 'controlplane', 'worker', function() {
    const image = get(this,`settings.${C.SETTING.AGENT_IMAGE}`);
    const cacerts = get(this,`settings.${C.SETTING.CA_CERTS}`);
    const checksum = AWS.util.crypto.sha256(cacerts+'\n','hex');
    const url = window.location.origin;
    const token = get(this,'token.token');

    let roleFlags='';
    const roles = ['etcd','controlplane','worker'];
    for ( let i = 0, k ; i < roles.length ; i++ ) {
      k = roles[i];
      if ( get(this,k) ) {
        roleFlags += ' --' + k;
      }
    }
    roleFlags = roleFlags.trim();

    let out = `docker run -d --restart=unless-stopped -v /var/run/docker.sock:/var/run/docker.sock --net=host ${image}${roleFlags} --server ${url} --token ${token} --ca-checksum ${checksum}`;

    const labels = get(this, 'labels')||{};
    Object.keys(labels).forEach((key) => {
      out += ` --label ${key}=${labels[key]}`;
    });

    return out;
  }),
});
