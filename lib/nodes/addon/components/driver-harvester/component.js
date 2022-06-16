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
  },

  actions: {
    async finishAndSelectCloudCredential(credential) {
      await this.globalStore.findAll('cloudcredential', { forceReload: true });
      set(this, 'model.cloudCredentialId', get(credential, 'id'));
    },

    updateYaml(type, value) {
      set(this,  `config.${ type }`, value);
    },
  },

  clearData: observer('currentCredential.id', function() {
    set(this, 'config.imageName', '');
    set(this, 'config.networkName', '');
    set(this, 'config.vmNamespace', '');
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

    hash({
      images:     get(this, 'globalStore').rawRequest({ url: `${ url }/v1/harvesterhci.io.virtualmachineimages` }),
      networks:   get(this, 'globalStore').rawRequest({ url: `${ url }/v1/k8s.cni.cncf.io.networkattachmentdefinition` }),
      namespaces: get(this, 'globalStore').rawRequest({ url: `${ url }/v1/namespace` }),
      configmaps: get(this, 'globalStore').rawRequest({ url: `${ url }/v1/configmap` }),
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

      const namespaces = resp.namespaces.body.data || [];
      const namespaceContent = namespaces
        .filter((O) => {
          return !this.isSystemNamespace(O);
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
      userData:                ''
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
});
