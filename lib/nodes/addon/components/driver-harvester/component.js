import { alias } from '@ember/object/computed';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import { throttledObserver } from 'ui/utils/debounce';
import { hash } from 'rsvp';

const DRIVER = 'harvester';
const CONFIG = 'harvesterConfig';

const SYSTEM_NAMESPACES = [
  'cattle-dashboards',
  'cattle-global-data',
  'cattle-system',
  'gatekeeper-system',
  'ingress-nginx',
  'kube-node-lease',
  'kube-public',
  'kube-system',
  'linkerd',
  'rio-system',
  'security-scan',
  'tekton-pipelines',
];

const TYPE = {
  AFFINITY:      'affinity',
  ANTI_AFFINITY: 'antiAffinity'
};

const PRIORITY = {
  REQUIRED:  'required',
  PREFERRED: 'preferred'
};

export default Component.extend(NodeDriver, {
  growl:     service(),
  settings: service(),
  intl:     service(),

  layout,
  driverName:           DRIVER,
  model:                {},

  currentCluster:     null,
  clusters:           [],
  clusterContent:     [],
  imageContent:       [],
  networkContent:     [],
  namespaceContent:   [],
  nodes:              [],
  namespaces:         [],
  nodeSchedulings:    [],
  podSchedulings:     [],
  networkDataContent: [],
  userDataContent:    [],
  controller:         null,
  signal:             '',
  isImportMode:       true,
  loading:            false,

  config: alias(`model.${ CONFIG }`),

  init() {
    this._super(...arguments);
    const controller = new AbortController();

    set(this, 'controller', controller);

    this.fetchResource();

    if (!!get(this, 'config.vmAffinity')) {
      this.initSchedulings();
    }
  },

  actions: {
    async finishAndSelectCloudCredential(credential) {
      await this.globalStore.findAll('cloudcredential', { forceReload: true });
      set(this, 'model.cloudCredentialId', get(credential, 'id'));
    },

    updateYaml(type, value) {
      set(this,  `config.${ type }`, value);
    },

    addNodeScheduling() {
      const neu = {
        priority:          PRIORITY.REQUIRED,
        nodeSelectorTerms: { matchExpressions: [] },
      };

      this.get('nodeSchedulings').pushObject(neu);
    },

    removeNodeScheduling(scheduling) {
      this.get('nodeSchedulings').removeObject(scheduling);
    },

    updateNodeScheduling() {
      this.parseNodeScheduling();
    },

    addPodScheduling() {
      const neu = {
        type:          TYPE.AFFINITY,
        priority:      PRIORITY.REQUIRED,
        labelSelector: { matchExpressions: [] },
        topologyKey:   ''
      };

      this.get('podSchedulings').pushObject(neu);
    },

    removePodScheduling(scheduling) {
      this.get('podSchedulings').removeObject(scheduling);
    },

    updatePodScheduling() {
      this.parsePodScheduling();
    }
  },

  clearData: observer('currentCredential.id', function() {
    set(this, 'config.imageName', '');
    set(this, 'config.networkName', '');
    set(this, 'config.vmNamespace', '');
    set(this, 'nodeSchedulings', []);
    set(this, 'podSchedulings', []);
    set(this, 'vmAffinity', {});
    set(this, 'config.vmAffinity', '');
  }),

  nodeSchedulingsChanged: observer('nodeSchedulings.[]', function() {
    this.parseNodeScheduling();
  }),

  podSchedulingsChanged: observer('podSchedulings.[]', function() {
    this.parsePodScheduling();
  }),

  fetchResource: throttledObserver('currentCredential.id', 'currentCredential.harvestercredentialConfig.clusterId', async function() {
    const clusterId = get(this, 'currentCredential') && get(this, 'currentCredential').harvestercredentialConfig && get(this, 'currentCredential').harvestercredentialConfig.clusterId;

    const url = clusterId  === 'local' ? '' : `/k8s/clusters/${ clusterId }`;

    if (!clusterId) {
      return;
    }

    let controller = get(this, 'controller');
    let signal = get(this, 'signal');

    signal = controller.signal;
    set(this, 'signal', signal);

    set(this, 'loading', true);

    hash({ nodes: get(this, 'globalStore').rawRequest({ url: `${ url }/v1/node` }) }).then((resp) => {
      set(this, 'nodes', resp.nodes.body.data || []);
    }).catch((err) => {
      const message = err.statusText || err.message;

      set(this, 'nodes', []);
      get(this, 'growl').fromError('Error request Node API', message);
    })

    hash({
      images:          get(this, 'globalStore').rawRequest({ url: `${ url }/v1/harvesterhci.io.virtualmachineimages` }),
      networks:        get(this, 'globalStore').rawRequest({ url: `${ url }/v1/k8s.cni.cncf.io.networkattachmentdefinition` }),
      namespaces:      get(this, 'globalStore').rawRequest({ url: `${ url }/v1/namespace` }),
      configmaps:      get(this, 'globalStore').rawRequest({ url: `${ url }/v1/configmap` }),
      systemNamespace: get(this, 'globalStore').rawRequest({ url: `${ url }/v1/management.cattle.io.settings/system-namespaces` }),
    }).then((resp) => {
      const images = resp.images.body.data || [];
      const imageContent = images.filter((O) => {
        return !O.spec.url.endsWith('.iso') && this.isReady.call(O);
      }).map((O) => {
        const value = O.id;
        const label = `${ O.spec.displayName } (${ value })`;

        return {
          label,
          value
        }
      });

      const networks = resp.networks.body.data || [];
      const networkContent = networks.map((O) => {
        let id = '';

        try {
          const config = JSON.parse(O.spec.config);

          id = config.vlan;
        } catch (err) {
          get(this, 'growl').fromError('Error parse network config', err);
        }

        const value = O.id;
        const label = `${ value } (vlanId=${ id })`;

        return {
          label,
          value
        }
      });

      const systemNamespaceValue  = resp.systemNamespace.body.value || '';
      const systemNamespaces = systemNamespaceValue.split(',');

      const namespaces = resp.namespaces.body.data || [];
      const namespaceContent = namespaces
        .filter((O) => {
          return !this.isSystemNamespace(O) && O.links.update && !systemNamespaces.includes(O.metadata.name);
        })
        .map((O) => {
          const value = O.id;
          const label = O.id;

          return {
            label,
            value
          }
        });

      const configmaps = resp.configmaps.body.data || [];
      const networkDataContent = [];
      const userDataContent = [];

      configmaps.map((O) => {
        const cloudTemplate = O.metadata && O.metadata.labels && O.metadata.labels['harvesterhci.io/cloud-init-template'];
        const value = O.data && O.data.cloudInit;
        const label = O.metadata.name;

        if (cloudTemplate === 'user') {
          userDataContent.push({
            label,
            value
          })
        } else if (cloudTemplate === 'network') {
          networkDataContent.push({
            label,
            value
          })
        }
      })

      setProperties(this, {
        imageContent,
        networkContent,
        namespaceContent,
        userDataContent,
        networkDataContent,
      });
    }).catch((err) => {
      setProperties(this, {
        imageContent:       [],
        networkContent:     [],
        namespaceContent:   [],
        userDataContent:    [],
        networkDataContent: [],
        namespaces:         [],
        vmAffinity:         [],
        nodeSchedulings:    [],
        podSchedulings:     [],
      })

      const message = err.statusText || err.message;

      get(this, 'growl').fromError('Error request Image API', message);
    }).finally(() => {
      set(this, 'loading', false);
    })

    controller.abort()
  }),

  harvestercredentialConfig: computed('cloudCredentials.@each.harvestercredentialConfig', function() {
    return (get(this, 'cloudCredentials') || []).mapBy('harvestercredentialConfig')
  }),

  currentCredential: computed('cloudCredentials', 'harvestercredentialConfig.[]', 'model.cloudCredentialId', function() {
    return (get(this, 'cloudCredentials') || []).find((C) => C.id === get(this, 'model.cloudCredentialId'));
  }),


  isImported: computed('currentCredential.harvestercredentialConfig.clusterType', function() {
    if (get(this, 'currentCredential') && get(this, 'currentCredential').harvestercredentialConfig) {
      return get(this, 'currentCredential').harvestercredentialConfig.clusterType === 'imported';
    }

    return false;
  }),

  isSystemNamespace(namespace) {
    if ( namespace.metadata && namespace.metadata.annotations && namespace.metadata.annotations['management.cattle.io/system-namespace'] === 'true' ) {
      return true;
    }

    if (namespace.metadata.labels['fleet.cattle.io/managed'] === 'true') {
      return true;
    }

    if ( SYSTEM_NAMESPACES.includes(namespace.metadata.name) ) {
      return true;
    }

    if ( namespace.metadata && namespace.metadata.name && namespace.metadata.name.endsWith('-system') ) {
      return true;
    }

    return false;
  },

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:                    CONFIG,
      cpuCount:                2,
      memorySize:              4,
      diskSize:                40,
      diskBus:                 'virtio',
      imageName:               '',
      sshUser:                 '',
      networkName:             '',
      networkData:             '',
      vmNamespace:             '',
      userData:                '',
      vmAffinity:              ''
    });

    set(this, `model.${ CONFIG }`, config);
  },

  validate() {
    this._super();
    let errors = get(this, 'errors') || [];

    if (!this.validateCloudCredentials()) {
      errors.push(this.intl.t('nodeDriver.cloudCredentialError'))
    }

    if (!get(this, 'config.vmNamespace')) {
      errors.push(this.intl.t('generic.required', { key: this.intl.t('nodeDriver.harvester.namespace.label') }));
    }

    if (!get(this, 'config.diskBus')) {
      errors.push(this.intl.t('generic.required', { key: this.intl.t('nodeDriver.harvester.diskBus.label') }));
    }

    if (!get(this, 'config.imageName')) {
      errors.push(this.intl.t('generic.required', { key: this.intl.t('nodeDriver.harvester.imageName.label') }));
    }

    if (!get(this, 'config.networkName')) {
      errors.push(this.intl.t('generic.required', { key: this.intl.t('nodeDriver.harvester.networkName.label') }));
    }

    if (!get(this, 'config.sshUser')) {
      errors.push(this.intl.t('generic.required', { key: this.intl.t('nodeDriver.harvester.sshUser.label') }));
    }

    this.validateScheduling(errors);

    // Set the array of errors for display,
    // and return true if saving should continue.

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },

  isReady() {
    function getStatusConditionOfType(type, defaultValue = []) {
      const conditions = Array.isArray(get(this, 'status.conditions')) ? this.status.conditions : defaultValue;

      return conditions.find( (cond) => cond.type === type);
    }

    const initialized = getStatusConditionOfType.call(this, 'Initialized');
    const imported = getStatusConditionOfType.call(this, 'Imported');
    const isCompleted = this.status?.progress === 100;

    if ([initialized?.status, imported?.status].includes('False')) {
      return false;
    } else {
      return isCompleted && true;
    }
  },

  isEmptyObject(obj) {
    return obj
    && Object.keys(obj).length === 0
    && Object.getPrototypeOf(obj) === Object.prototype;
  },

  initSchedulings() {
    const nodeSchedulings = [];
    const podSchedulings = [];
    const parsedObj = JSON.parse(AWS.util.base64.decode(get(this, 'config.vmAffinity')).toString());
    const nodeAffinityRequired = get(parsedObj, 'nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution');
    const nodeAffinityPreferred = get(parsedObj, 'nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution');
    const podAffinityRequired = get(parsedObj, 'podAffinity.requiredDuringSchedulingIgnoredDuringExecution');
    const podAffinityPreferred = get(parsedObj, 'podAffinity.preferredDuringSchedulingIgnoredDuringExecution');
    const podAntiAffinityRequired = get(parsedObj, 'podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution');
    const podAntiAffinityPreferred = get(parsedObj, 'podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution');

    if (nodeAffinityRequired) {
      nodeAffinityRequired.nodeSelectorTerms.forEach((S) => {
        nodeSchedulings.push({
          priority:          PRIORITY.REQUIRED,
          nodeSelectorTerms: { matchExpressions: S.matchExpressions },
        })
      });
    }

    if (nodeAffinityPreferred) {
      nodeAffinityPreferred.forEach((S) => {
        nodeSchedulings.push({
          priority:          PRIORITY.PREFERRED,
          nodeSelectorTerms: { matchExpressions: S.preference.matchExpressions },
        })
      });
    }

    if (podAffinityRequired) {
      podAffinityRequired.forEach((S) => {
        podSchedulings.push({
          type:          TYPE.AFFINITY,
          priority:      PRIORITY.REQUIRED,
          labelSelector: { matchExpressions: S.labelSelector.matchExpressions },
          topologyKey:   S.topologyKey,
          namespaces:    S.namespaces || [],
          weight:        S.weight || ''
        })
      });
    }

    if (podAffinityPreferred) {
      podAffinityPreferred.forEach((S) => {
        podSchedulings.push({
          type:          TYPE.AFFINITY,
          priority:      PRIORITY.PREFERRED,
          labelSelector: { matchExpressions: S.podAffinityTerm.labelSelector.matchExpressions },
          topologyKey:   S.podAffinityTerm.topologyKey,
          namespaces:    get(S, 'podAffinityTerm.namespaces') || [],
          weight:        get(S, 'podAffinityTerm.weight') || ''
        })
      });
    }

    if (podAntiAffinityRequired) {
      podAntiAffinityRequired.forEach((S) => {
        podSchedulings.push({
          type:          TYPE.ANTI_AFFINITY,
          priority:      PRIORITY.REQUIRED,
          labelSelector: { matchExpressions: S.labelSelector.matchExpressions },
          topologyKey:   S.topologyKey,
          namespaces:    S.namespaces || [],
          weight:        S.weight || ''
        })
      });
    }

    if (podAntiAffinityPreferred) {
      podAntiAffinityPreferred.forEach((S) => {
        podSchedulings.push({
          type:          TYPE.ANTI_AFFINITY,
          priority:      PRIORITY.PREFERRED,
          labelSelector: { matchExpressions: S.podAffinityTerm.labelSelector.matchExpressions },
          topologyKey:   S.podAffinityTerm.topologyKey,
          namespaces:    get(S, 'podAffinityTerm.namespaces') || [],
          weight:        get(S, 'podAffinityTerm.weight') || ''
        })
      });
    }

    set(this, 'nodeSchedulings', nodeSchedulings);
    set(this, 'podSchedulings', podSchedulings);
  },

  parseNodeScheduling() {
    const arr = this.nodeSchedulings;
    const out = {};

    if (arr.find((S) => S.priority === PRIORITY.REQUIRED)) {
      out.requiredDuringSchedulingIgnoredDuringExecution = { nodeSelectorTerms: [] }
    }

    if (arr.find((S) => S.priority === PRIORITY.PREFERRED)) {
      out.preferredDuringSchedulingIgnoredDuringExecution = [];
    }

    arr.forEach((S) => {
      if (S.priority === PRIORITY.REQUIRED) {
        out.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.push({ matchExpressions: S.nodeSelectorTerms.matchExpressions })
      }

      if (S.priority === PRIORITY.PREFERRED) {
        out.preferredDuringSchedulingIgnoredDuringExecution.push({ preference: { matchExpressions: S.nodeSelectorTerms.matchExpressions } })
      }
    })

    const parseObj = { ...get(this, 'vmAffinity') };

    if (!this.isEmptyObject(out)) {
      set(parseObj, 'nodeAffinity', out);
    } else {
      delete parseObj.nodeAffinity;
    }

    set(this, 'config.vmAffinity', this.isEmptyObject(parseObj) ? '' : AWS.util.base64.encode(JSON.stringify(parseObj)));
    set(this, 'vmAffinity', parseObj);
  },

  parsePodScheduling() {
    const arr = this.podSchedulings;
    const out = {};

    if (arr.find((S) => S.type === TYPE.AFFINITY)) {
      out.podAffinity = {};
    }

    if (arr.find((S) => S.type === TYPE.ANTI_AFFINITY)) {
      out.podAntiAffinity = {};
    }

    if (arr.find((S) => S.type === TYPE.AFFINITY && S.priority === PRIORITY.REQUIRED)) {
      out.podAffinity.requiredDuringSchedulingIgnoredDuringExecution = [];
    }

    if (arr.find((S) => S.type === TYPE.AFFINITY && S.priority === PRIORITY.PREFERRED)) {
      out.podAffinity.preferredDuringSchedulingIgnoredDuringExecution = [];
    }

    if (arr.find((S) => S.type === TYPE.ANTI_AFFINITY && S.priority === PRIORITY.REQUIRED)) {
      out.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution = [];
    }

    if (arr.find((S) => S.type === TYPE.ANTI_AFFINITY && S.priority === PRIORITY.PREFERRED)) {
      out.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution = [];
    }


    arr.forEach((S) => {
      const requiredObj = {
        labelSelector: S.labelSelector,
        topologyKey:   S.topologyKey,
      };

      const preferredObj = {
        podAffinityTerm: {
          labelSelector: S.labelSelector,
          topologyKey:   S.topologyKey
        }
      }

      if (S.namespaces) {
        requiredObj.namespaces = S.namespaces;
        preferredObj.podAffinityTerm.namespaces = S.namespaces;
      }

      if (S.weight) {
        requiredObj.weight = S.weight;
        preferredObj.weight = S.weight;
      }

      if (S.type === TYPE.AFFINITY && S.priority === PRIORITY.REQUIRED) {
        out.podAffinity.requiredDuringSchedulingIgnoredDuringExecution.push(requiredObj);
      }

      if (S.type === TYPE.AFFINITY && S.priority === PRIORITY.PREFERRED) {
        out.podAffinity.preferredDuringSchedulingIgnoredDuringExecution.push(preferredObj);
      }

      if (S.type === TYPE.ANTI_AFFINITY && S.priority === PRIORITY.REQUIRED) {
        out.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution.push(requiredObj)
      }

      if (S.type === TYPE.ANTI_AFFINITY && S.priority === PRIORITY.PREFERRED) {
        out.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.push(preferredObj);
      }
    });

    const parseObj = { ...get(this, 'vmAffinity') }

    if (!this.isEmptyObject(get(out, 'podAffinity') || {})) {
      set(parseObj, 'podAffinity', get(out, 'podAffinity'));
    } else {
      delete parseObj.podAffinity;
    }

    if (!this.isEmptyObject(get(out, 'podAntiAffinity') || {})) {
      set(parseObj, 'podAntiAffinity', get(out, 'podAntiAffinity'));
    } else {
      delete parseObj.podAntiAffinity;
    }

    set(this, 'config.vmAffinity', this.isEmptyObject(parseObj) ? '' : AWS.util.base64.encode(JSON.stringify(parseObj)));
    set(this, 'vmAffinity', parseObj);
  },

  validateScheduling(errors) {
    if (get(this, 'podSchedulings').find((S) => !S.topologyKey)) {
      errors.push(this.intl.t('generic.required', { key: this.intl.t('nodeDriver.harvester.scheduling.input.topology.label') }));
    }

    const nodeHasMissingKey = get(this, 'nodeSchedulings').find((S) => {
      return get(S, 'nodeSelectorTerms.matchExpressions').find((M) => !get(M, 'key'));
    });

    const podHasMissingKey = get(this, 'podSchedulings').find((S) => {
      return get(S, 'labelSelector.matchExpressions').find((M) => !get(M, 'key'));
    });

    if (nodeHasMissingKey || podHasMissingKey) {
      errors.push(this.intl.t('generic.required', { key: this.intl.t('formNodeRequirement.key.label') }));
    }
  }

});
