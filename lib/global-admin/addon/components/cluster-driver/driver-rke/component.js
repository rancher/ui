import Component from '@ember/component'
import ClusterDriver from 'global-admin/mixins/cluster-driver';
import { equal } from '@ember/object/computed';
import { get, set, computed, observer } from '@ember/object';
import { satisfies } from 'shared/utils/parse-version';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

const headers = [
  {
    name: 'prefix',
    sort: ['prefix', 'id'],
    translationKey: 'clusterNew.rke.nodes.prefix',
    scope: 'embedded',
  },
  {
    name: 'count',
    sort: ['count', 'displayName.id'],
    translationKey: 'clusterNew.rke.nodes.count',
    width: 120,
  },
  {
    name: 'nodeTemplate',
    sort: ['nodeTemplate.displayName', 'nodeTemplate.id'],
    translationKey: 'clusterNew.rke.nodes.template',
  },
  {
    name: 'etcd',
    sort: false,
    translationKey: 'clusterNew.rke.role.header.etcd',
    classNames: ['text-center'],
    width: 120,
  },
  {
    name: 'controlplane',
    sort: false,
    translationKey: 'clusterNew.rke.role.header.controlplane',
    classNames: ['text-center'],
    width: 120,
  },
  {
    name: 'worker',
    sort: false,
    translationKey: 'clusterNew.rke.role.header.worker',
    scope: 'embedded',
    classNames: ['text-center'],
    width: 120,
  },
  {
    name: 'remove',
    sort: false,
    classNames: ['text-center'],
    width: 50,
  }
];

export default Component.extend(ClusterDriver, {
  globalStore: service(),
  settings: service(),

  configField: 'rancherKubernetesEngineConfig',
  headers,

  initialVersion: null,

  networkChoices: [
    { label: 'clusterNew.rke.network.flannel', value: 'flannel' },
    { label: 'clusterNew.rke.network.calico',  value: 'calico' },
    { label: 'clusterNew.rke.network.canal',   value: 'canal' },
  ],

  authChoices: [
    { label: 'clusterNew.rke.auth.x509', value: 'x509' },
  ],

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
        kubernetesVersion: get(this, `settings.${C.SETTING.VERSION_K8S_DEFAULT}`),
        authentication: globalStore.createRecord({
          type: 'authnConfig',
          strategy: 'x509',
        }),
        network: globalStore.createRecord({
          type: 'networkConfig',
          plugin: 'flannel',
        }),
      });
      set(this, 'cluster.rancherKubernetesEngineConfig', config);
    }

    set(this, 'initialVersion', get(this, 'cluster.rancherKubernetesEngineConfig.kubernetesVersion'));
  },

  actions: {
    setLabels(labels) {
      set(this, 'labels', labels);
      var out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('labels', out);
    },

    addNode() {
      let nodePools = get(this, 'cluster.nodePools');
      if ( !nodePools ) {
        nodePools = [];
        set(this, 'cluster.nodePools', nodePools);
      }

      let templateId = null;
      const lastNode = nodePools[nodePools.length-1];
      if ( lastNode ) {
        templateId = get(lastNode, 'nodeTemplateId');
      }

      nodePools.pushObject(get(this, 'globalStore').createRecord({
        type: 'nodePool',
        nodeTemplateId: templateId
      }));
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

  versionChanged: observer('config.kubernetesVersion','versionChoices.[]', function() {
    const versions = get(this, 'versionChoices')||[];
    const current = get(this, 'config.kubernetesVersion');
    const exists = versions.findBy('value', current);
    if ( !exists ) {
      set(this, 'config.kubernetesVersion', versions[0].value);
    }
  }),

  versionChoices: computed('initialVersion', `settings.${C.SETTING.VERSIONS_K8S}`, 'config.kubernetesVersion', function() {
    const versions = JSON.parse(get(this, `settings.${C.SETTING.VERSIONS_K8S}`)||'{}');

    if ( !versions ) {
      return [];
    }

    const initialVersion = get(this, 'initialVersion');
    let oldestSupportedVersion = '>=1.8.0';
    if ( initialVersion ) {
      oldestSupportedVersion = '>=' + initialVersion;
    }

    let out = Object.keys(versions);

    out = out.filter((v) => {
      const str = v.replace(/-.*/,'');
      return satisfies(str, oldestSupportedVersion);
    });

    if (get(this, 'editing') &&  !out.includes(initialVersion) ) {
      out.unshift(initialVersion);
    }

    return out.map((v) => {
      return {value: v}
    });
  }),

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

    let out = `docker run -d --restart=unless-stopped -v /var/run/docker.sock:/var/run/docker.sock --net=host ${image} --server ${url} --token ${token} --ca-checksum ${checksum}${roleFlags}`;

    const labels = get(this, 'labels')||{};
    Object.keys(labels).forEach((key) => {
      out += ` --label ${key}=${labels[key]}`;
    });

    return out;
  }),
});
