import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import { equal, alias, or } from '@ember/object/computed';
import { get, set, computed, observer } from '@ember/object';
import { satisfies } from 'shared/utils/parse-version';
import { sortVersions } from 'shared/utils/sort';
import { inject as service } from '@ember/service';
import { validateEndpoint } from 'shared/utils/util';
import C from 'shared/utils/constants';
import layout from './template';
import { resolve } from 'rsvp';

export default Component.extend(ClusterDriver, {
  layout,
  globalStore: service(),
  settings: service(),
  growl: service(),
  intl: service(),

  configField: 'rancherKubernetesEngineConfig',

  model: null,

  initialVersion: null,
  loading: false,
  isNew: equal('mode', 'new'),
  isEdit: equal('mode', 'edit'),
  notView: or('isNew', 'isEdit'),
  clusterState: alias('model.originalCluster.state'),

  networkChoices: [
    { label: 'clusterNew.rke.network.flannel', value: 'flannel' },
    { label: 'clusterNew.rke.network.calico',  value: 'calico' },
    { label: 'clusterNew.rke.network.canal',   value: 'canal' },
  ],

  authChoices: [
    { label: 'clusterNew.rke.auth.x509', value: 'x509' },
  ],

  ingressChoices: [
    { label: 'clusterNew.rke.ingress.nginx', value: 'nginx' },
    { label: 'clusterNew.rke.ingress.none', value: 'none' },
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

    set(this, 'initialVersion', get(this, 'cluster.rancherKubernetesEngineConfig.kubernetesVersion'));

    const config = get(this, 'cluster.rancherKubernetesEngineConfig');
    if ( get(config, 'privateRegistries.length') > 0 ) {
      const registry = get(config, 'privateRegistries.firstObject');
      set(this, 'registry', 'custom');
      set(this, 'registryUrl', get(registry, 'url'));
      set(this, 'registryUser', get(registry, 'user'));
      set(this, 'registryPass', get(registry, 'password'));
    }
  },

  didInsertElement() {
    if ( ! get(this,'cluster.rancherKubernetesEngineConfig') ) {
      const globalStore = get(this, 'globalStore');
      let config = globalStore.createRecord({
        type: 'rancherKubernetesEngineConfig',
        ignoreDockerVersion: true,
        kubernetesVersion: get(this, `settings.${C.SETTING.VERSION_K8S_DEFAULT}`),
        authentication: globalStore.createRecord({
          type: 'authnConfig',
          strategy: 'x509',
        }),
        network: globalStore.createRecord({
          type: 'networkConfig',
          plugin: 'canal',
        }),
        ingress: globalStore.createRecord({
          type: 'ingressConfig',
          provider: 'nginx',
        }),
        services: globalStore.createRecord({
          type: 'rkeConfigServices',
          kubeApi: globalStore.createRecord({
            type: 'kubeAPIService',
            podSecurityPolicy: false,
          }),
          etcd: globalStore.createRecord({
            type: 'etcdService',
            extraArgs: {
              'heartbeat-interval': 500,
              'election-timeout': 5000
            },
          }),
        }),
      });
      set(this, 'cluster.rancherKubernetesEngineConfig', config);
    }

    if ( get(this, 'isNew') ) {
      this.driverDidChange();
    }
  },

  driverDidChange: observer('nodeWhich', function () {
    if ( !get(this, 'isNew') ) {
      return;
    }

    const config = get(this, 'cluster.rancherKubernetesEngineConfig');

    if ( get(config, 'cloudProvider') ){
      delete config.cloudProvider;
    }
  }),

  didReceiveAttrs() {
    if ( get(this,'isEdit') ) {
      this.loadToken();
    }
  },

  actions: {
    setNodePoolErrors(errors) {
      set(this, 'nodePoolErrors', errors);
    },
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

  validate() {
    this._super(...arguments);
    const errors = get(this,'errors')||[];

    if ( !get(this, 'isCustom') ) {
      errors.pushObjects(get(this, 'nodePoolErrors'));
    }

    if ( get(this, 'config.services.kubeApi.podSecurityPolicy') &&
        !get(this, 'cluster.defaultPodSecurityPolicyTemplateId') ) {
      errors.push(get(this, 'intl').t('clusterNew.psp.required'));
    }

    set(this, 'errors', errors);
    return errors.length === 0;
  },

  doneSaving() {
    if ( get(this, 'isCustom') ) {
      if ( get(this, 'isEdit') ) {
        this.sendAction('close');
      } else {
        this.loadToken();
      }
    } else {
      this.sendAction('close');
    }

    return resolve();
  },

  loadToken() {
    const cluster = get(this,'cluster');
    set(this, 'step', 2);
    set(this, 'loading', true);
    return cluster.getOrCreateToken().then((token) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }
      set(this, 'token', token);
      set(this, 'loading', false);
    }).catch((err) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      get(this,'growl').fromError('Error getting command', err);
      set(this, 'loading', false);
    });
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

    return sortVersions(out).reverse().map((v) => {
      return {value: v}
    });
  }),

  isAddressValid: computed('address', function() {
    return get(this, 'address') === undefined || get(this, 'address.length') === 0 || validateEndpoint(get(this, 'address'));
  }),

  isInternalAddressValid: computed('internalAddress', function() {
    return get(this, 'internalAddress') === undefined || get(this, 'internalAddress.length') === 0 || validateEndpoint(get(this, 'internalAddress'));
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
    let clusterId = get(this,'cluster.id');
    let orig = get(this, 'initialNodeCounts')[clusterId] || 0;
    let cur = get(this, 'existingNodes').filterBy('clusterId', clusterId).length

    if ( cur < orig ) {
      orig = cur;
      set (get(this,'initialNodeCounts'), clusterId, cur)
    }

    return cur - orig;
  }),

  networkDidChange: observer('config.network.plugin', function () {
    const plugin = get(this, 'config.network.plugin');
    if (plugin === 'flannel') {
      set(this, 'config.network.flannelNetworkProvider', {});
      set(this, 'config.network.calicoNetworkProvider', null);
    } else if (plugin === 'calico') {
      set(this, 'config.network.calicoNetworkProvider', {});
      set(this, 'config.network.flannelNetworkProvider', null);
    } else {
      set(this, 'config.network.calicoNetworkProvider', null);
      set(this, 'config.network.flannelNetworkProvider', null);
    }
  }),

  command: computed(`settings.${C.SETTING.AGENT_IMAGE}`, 'labels', 'token.nodeCommand', 'etcd', 'controlplane', 'worker', 'address', 'internalAddress', function() {
    let out = get(this, 'token.nodeCommand');

    if ( !out ) {
      return;
    }

    const address = get(this, 'address');
    if(address) {
      out += ` --address ${address}`;
    }

    const internalAddress = get(this, 'internalAddress');
    if(internalAddress) {
      out += ` --internal-address ${internalAddress}`;
    }

    const roles = ['etcd','controlplane','worker'];
    for ( let i = 0, k ; i < roles.length ; i++ ) {
      k = roles[i];
      if ( get(this,k) ) {
        out += ` --${k}`;
      }
    }

    const labels = get(this, 'labels')||{};
    Object.keys(labels).forEach((key) => {
      out += ` --label ${key}=${labels[key]}`;
    });

    return out;
  }),
});
