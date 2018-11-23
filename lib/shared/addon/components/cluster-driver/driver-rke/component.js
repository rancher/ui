import ClusterDriver from 'shared/mixins/cluster-driver';
import { equal, alias, or } from '@ember/object/computed';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { satisfies } from 'shared/utils/parse-version';
import { sortVersions } from 'shared/utils/sort';
import { inject as service } from '@ember/service';
import { underlineToCamel, removeEmpty, keysToCamel, validateEndpoint } from 'shared/utils/util';
import { validateHostname } from 'ember-api-store/utils/validate';

import C from 'shared/utils/constants';
import YAML from 'yamljs';
import json2yaml from 'json2yaml';
import layout from './template';
import { resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import InputTextFile from 'ui/components/input-text-file/component';
import { scheduleOnce } from '@ember/runloop';
import { azure as AzureInfo } from 'shared/components/cru-cloud-provider/cloud-provider-info';

const EXCLUDED_KEYS = ['extra_args'];

function camelToUnderline(str, split = true) {
  str = (str || '');
  if ( str.indexOf('-') > -1 || str.endsWith('CloudProvider')) {
    return str;
  } else if ( split ) {
    return (str || '').dasherize().split('-').join('_');
  } else {
    return (str || '').dasherize();
  }
}

const NETWORKCHOICES = [
  {
    label: 'clusterNew.rke.network.flannel',
    value: 'flannel'
  },
  {
    label: 'clusterNew.rke.network.calico',
    value: 'calico'
  },
  {
    label: 'clusterNew.rke.network.canal',
    value: 'canal'
  },
];

const FLANNEL              = 'flannel'
const CANAL                = 'canal'
const HOST_GW              = 'host-gw'
const DEFAULT_BACKEND_TYPE = 'vxlan';

const AUTHCHOICES = [
  {
    label: 'clusterNew.rke.auth.x509',
    value: 'x509'
  },
];

const INGRESSCHOICES = [
  {
    label: 'clusterNew.rke.ingress.nginx',
    value: 'nginx'
  },
  {
    label: 'clusterNew.rke.ingress.none',
    value: 'none'
  },
];

export default InputTextFile.extend(ClusterDriver, {
  globalStore:          service(),
  settings:             service(),
  growl:                service(),
  intl:                 service(),

  layout,
  networkContent:       NETWORKCHOICES,
  authChoices:          AUTHCHOICES,
  ingressChoices:       INGRESSCHOICES,

  configField:          'rancherKubernetesEngineConfig',
  registry:             'default',
  accept:               '.yml, .yaml',
  loading:              false,
  pasteOrUpload:        false,
  model:                null,
  initialVersion:       null,
  registryUrl:          null,
  registryUser:         null,
  registryPass:         null,
  clusterOptErrors:     null,
  nodeNameErrors:       null,

  existingNodes:        null,
  initialNodeCounts:    null,
  step:                 1,
  token:                null,
  labels:               null,
  etcd:                 false,
  controlplane:         false,
  worker:               true,
  defaultDockerRootDir: null,

  windowsEnable:        false,
  isLinux:              true,
  windowsSupport:       false,
  isNew:                equal('mode', 'new'),
  isEdit:               equal('mode', 'edit'),
  notView:              or('isNew', 'isEdit'),
  clusterState:         alias('model.originalCluster.state'),

  // Custom stuff
  isCustom:             equal('nodeWhich', 'custom'),

  init() {
    this._super();

    const globalStore = get(this, 'globalStore');
    const counts = {};

    set(this, 'existingNodes', globalStore.all('node'));

    globalStore.findAll('node').then((all) => {
      all.forEach((node) => {
        const id = get(node, 'clusterId');

        counts[id] = (counts[id] || 0) + 1;
      });

      this.notifyPropertyChange('initialNodeCounts');
    });

    set(this, 'initialNodeCounts', counts);

    set(this, 'initialVersion', get(this, 'cluster.rancherKubernetesEngineConfig.kubernetesVersion'));

    const config = get(this, 'cluster.rancherKubernetesEngineConfig');

    if ( config && get(config, 'privateRegistries.length') > 0 ) {
      const registry = get(config, 'privateRegistries.firstObject');

      setProperties(this, {
        registry:     'custom',
        registryUrl:  get(registry, 'url'),
        registryUser: get(registry, 'user'),
        registryPass: get(registry, 'password'),
      });
    }

    this.driverDidChange();

    scheduleOnce('afterRender', () => {
      let defaultCluster = globalStore.createRecord({ type: 'cluster' })

      set(this, 'defaultDockerRootDir', defaultCluster.dockerRootDir)

      if (get(this, 'isEdit')) {
        if (get(this, 'config.network.options.flannel_backend_type') === HOST_GW) {
          set(this, 'windowsSupport', true)
        }
      }
    });
  },

  didReceiveAttrs() {
    if ( get(this, 'isEdit') ) {
      this.loadToken();
    }
  },

  actions: {

    setNodePoolErrors(errors) {
      set(this, 'nodePoolErrors', errors);
    },

    cancel() {
      set(this, 'pasteOrUpload', false);
    },

    showPaste() {
      set(this, 'pasteOrUpload', true);
    },
  },

  networkPluginDidChange: observer('cluster.rancherKubernetesEngineConfig.network.plugin', function() {
    let plugin = get(this, 'config.network.plugin');

    if (plugin && plugin !== CANAL) {
      set(this, 'cluster.enableNetworkPolicy', false);
    }
    if (plugin && plugin !== FLANNEL) {
      set(this, 'windowsSupport', false)
    }
  }),

  driverDidChange: observer('nodeWhich', function() {
    if ( get(this, 'isNew') ) {
      const globalStore = get(this, 'globalStore');

      const rkeConfig = globalStore.createRecord({
        type:                'rancherKubernetesEngineConfig',
        ignoreDockerVersion: true,
        kubernetesVersion:   get(this, `settings.${ C.SETTING.VERSION_K8S_DEFAULT }`),
        authentication:      globalStore.createRecord({
          type:     'authnConfig',
          strategy: 'x509',
        }),
        network: globalStore.createRecord({
          type:    'networkConfig',
          plugin:  'canal',
          options: { flannel_backend_type: DEFAULT_BACKEND_TYPE, },
        }),
        ingress: globalStore.createRecord({
          type:     'ingressConfig',
          provider: 'nginx',
        }),
        monitoring: globalStore.createRecord({
          type:     'monitoringConfig',
          provider: 'metrics-server',
        }),
        services: globalStore.createRecord({
          type:    'rkeConfigServices',
          kubeApi: globalStore.createRecord({
            type:                  'kubeAPIService',
            podSecurityPolicy:     false,
            serviceNodePortRange: '30000-32767',
          }),
          etcd: globalStore.createRecord({
            type:      'etcdService',
            extraArgs: {
              'heartbeat-interval': 500,
              'election-timeout':   5000
            },
          }),
        }),
      });


      scheduleOnce('afterRender', () => {
        set(this, 'cluster.rancherKubernetesEngineConfig', rkeConfig);
        set(this, 'cluster.enableNetworkPolicy', false);
      });
    }

    let { networkContent } = this;
    let flannel = networkContent.findBy('value', 'flannel');

    if (get(this, 'isCustom')) {
      set(flannel, 'label', 'clusterNew.rke.network.flannelCustom');
    } else {
      set(flannel, 'label', 'clusterNew.rke.network.flannel');
    }
  }),

  versionChanged: observer('config.kubernetesVersion', 'versionChoices.[]', function() {
    const versions = get(this, 'versionChoices') || [];
    const current  = get(this, 'config.kubernetesVersion');
    const exists   = versions.findBy('value', current);

    if ( !exists ) {
      set(this, 'config.kubernetesVersion', versions[0].value);
    }
  }),

  windowsSupportChange: observer('windowsSupport', function() {
    const windowsSupport = get(this, 'windowsSupport')
    const config = get(this, 'cluster.rancherKubernetesEngineConfig')

    if (windowsSupport) {
      set(config, 'network.options.flannel_backend_type', HOST_GW)
    } else {
      set(config, 'network.options.flannel_backend_type', DEFAULT_BACKEND_TYPE)
    }
  }),

  isLinuxChanged: observer('isLinux', function() {
    if (get(this, 'nodeWhich') !== 'custom') {
      return
    }

    const isLinux = get(this, 'isLinux')

    if (!isLinux) {
      setProperties(this, {
        controlplane: false,
        etcd:         false,
        worker:       true,
      })
    }
  }),

  kubeApiPodSecurityPolicy: computed('config.services.kubeApi.podSecurityPolicy', {
    get() {
      let pspConfig = get(this, 'config.services.kubeApi');

      if (typeof  pspConfig === 'undefined') {
        return false;
      }

      return get(pspConfig, 'podSecurityPolicy');
    },
    set(key, value) {
      if (typeof get(this, 'config.services') === 'undefined') {
        set(this, 'config.services', get(this, 'globalStore').createRecord({
          type:     'rkeConfigServices',
          kubeApi: get(this, 'globalStore').createRecord({
            type:              'kubeAPIService',
            podSecurityPolicy: value,
          }),
        }));
      } else {
        set(this, 'config.services', { kubeApi: { podSecurityPolicy: value } });
      }

      return value;
    }
  }),

  monitoringProvider: computed('config.monitoring', {
    get() {
      let monitoringConfig = get(this, 'config.monitoring');

      if (typeof  monitoringConfig === 'undefined') {
        return null;
      }

      return get(monitoringConfig, 'provider');
    },
    set(key, value) {
      if (typeof get(this, 'config.monitoring') === 'undefined') {
        set(this, 'config.monitoring', get(this, 'globalStore').createRecord({
          type:     'monitoringConfig',
          provider: value
        }));
      } else {
        set(this, 'config.monitoring', { provider: value });
      }

      return value;
    }
  }),

  nginxIngressProvider: computed('config.ingress', {
    get() {
      let ingressConfig = get(this, 'config.ingress');

      if (typeof  ingressConfig === 'undefined') {
        return null;
      }

      return get(ingressConfig, 'provider');
    },
    set(key, value) {
      if (typeof get(this, 'config.ingress') === 'undefined') {
        set(this, 'config.ingress', get(this, 'globalStore').createRecord({
          type:     'ingressConfig',
          provider: value
        }));
      } else {
        set(this, 'config.ingress', { provider: value });
      }

      return value;
    }
  }),

  versionChoices: computed('initialVersion', `settings.${ C.SETTING.VERSIONS_K8S }`, 'config.kubernetesVersion', function() {
    const versions = JSON.parse(get(this, `settings.${ C.SETTING.VERSIONS_K8S }`) || '{}');
    const { experimentalVersion } = this;

    if ( !versions ) {
      return [];
    }

    const initialVersion = get(this, 'initialVersion');

    let oldestSupportedVersion = '>=1.8.0';

    if ( initialVersion ) {
      oldestSupportedVersion = `>=${  initialVersion }`;
    }

    let out = Object.keys(versions);

    out = out.filter((v) => {
      const str = v.replace(/-.*/, '');

      return satisfies(str, oldestSupportedVersion);
    });

    if (get(this, 'mode') === 'edit' && !out.includes(initialVersion) ) {
      out.unshift(initialVersion);
    }

    return sortVersions(out).reverse().map((v) => {
      let label = v;

      if (v === experimentalVersion) {
        label = `${ v } (experimental)`
      }

      return {
        label,
        value: v
      };
    });
  }),

  isNodeNameValid: computed('nodeName', function() {
    const nodeName = (get(this, 'nodeName') || '').toLowerCase();

    if ( get(nodeName, 'length') === 0 ) {
      return true;
    } else {
      const errors = validateHostname(nodeName, 'Node Name', get(this, 'intl'), { restricted: true });

      set(this, 'nodeNameErrors', errors);

      return errors.length === 0;
    }
  }),

  isAddressValid: computed('address', function() {
    return get(this, 'address') === undefined || get(this, 'address.length') === 0 || validateEndpoint(get(this, 'address'));
  }),

  isInternalAddressValid: computed('internalAddress', function() {
    return get(this, 'internalAddress') === undefined || get(this, 'internalAddress.length') === 0 || validateEndpoint(get(this, 'internalAddress'));
  }),

  newNodeCount: computed('initialNodeCounts', 'cluster.id', 'existingNodes.@each.clusterId', function() {
    let clusterId = get(this, 'cluster.id');
    let orig      = get(this, 'initialNodeCounts')[clusterId] || 0;
    let cur       = get(this, 'existingNodes').filterBy('clusterId', clusterId).length

    if ( cur < orig ) {
      orig = cur;
      set(get(this, 'initialNodeCounts'), clusterId, cur)
    }

    return cur - orig;
  }),

  command: computed('labels', 'token.nodeCommand', 'token.windowsNodeCommand', 'etcd', 'controlplane', 'worker', 'address', 'internalAddress', 'nodeName', 'isLinux', function() {
    let out = get(this, 'token.nodeCommand');

    if ( !out ) {
      return;
    }

    const address         = get(this, 'address');
    const nodeName        = get(this, 'nodeName');
    const internalAddress = get(this, 'internalAddress');
    const roles           = ['etcd', 'controlplane', 'worker'];
    const labels          = get(this, 'labels') || {};

    if ( nodeName ) {
      out += ` --node-name ${ nodeName.toLowerCase() }`;
    }

    if (address) {
      out += ` --address ${ address }`;
    }

    if (internalAddress) {
      out += ` --internal-address ${ internalAddress }`;
    }

    for ( let i = 0, k ; i < roles.length ; i++ ) {
      k = roles[i];

      if ( get(this, k) ) {
        out += ` --${ k }`;
      }
    }

    Object.keys(labels).forEach((key) => {
      out += ` --label ${ key }=${ labels[key] }`;
    });

    const windowsSelected = !get(this, 'isLinux')

    if (windowsSelected) {
      out = get(this, 'token.windowsNodeCommand') || ''
      out = out.replace('--isolation hyperv ', '')
      let addressCmd = ''

      if (address) {
        addressCmd += ` -address ${ address }`
      }

      if (internalAddress) {
        addressCmd += ` -internalAddress ${ internalAddress }`
      }

      if (addressCmd) {
        out = out.replace(`; if($?)`, `${ addressCmd }; if($?)`)
      }
    }

    return out;
  }),

  value: computed('pasteOrUpload', {

    get() {
      const intl = get(this, 'intl');

      let config = this.getSupportedFields(get(this, 'cluster.rancherKubernetesEngineConfig'), 'rancherKubernetesEngineConfig');

      if ( !config ) {
        return '';
      }

      config = removeEmpty(config, EXCLUDED_KEYS);

      while ( JSON.stringify(config) !== JSON.stringify(removeEmpty(config, EXCLUDED_KEYS)) ){
        config = removeEmpty(config, EXCLUDED_KEYS);
      }

      let yaml = json2yaml.stringify(config);
      const lines = yaml.split('\n');

      lines.shift();

      let out = '';

      lines.forEach((line) => {
        if ( line.trim() ) {
          const key = `rkeConfigComment.${ line.split(':')[0].trim() }`

          if ( intl.exists(key) ) {
            const commentLines = intl.t(key).split('\n');

            commentLines.forEach((commentLine) => {
              out += `# ${ commentLine.slice(1, commentLine.length - 1) }\n`;
            });
          }

          out += `${ line.slice(2) }\n`;
        }
      });

      return out;
    },

    set(key, value) {
      let configs;

      try {
        configs = YAML.parse(value);
      } catch ( err ) {
        set(this, 'clusterOptErrors', [`Cluster Options Parse Error: ${ err.snippet } - ${ err.message }`]);

        return value;
      }

      set(this, 'clusterOptErrors', []);

      const validFields = this.getResourceFields('rancherKubernetesEngineConfig');

      Object.keys(configs || {}).forEach((key) => {
        if ( validFields[underlineToCamel(key)] ) {
          const obj = keysToCamel(configs[key]);

          if ( key === 'services' && obj['kube-api'] ) {
            set(obj, 'kubeApi', obj['kube-api']);
            delete obj['kube-api'];
          }

          if ( key === 'services' && obj['kube-controller'] ) {
            set(obj, 'kubeController', obj['kube-controller']);
            delete obj['kube-controller'];
          }

          set(this, `cluster.rancherKubernetesEngineConfig.${ underlineToCamel(key) }`, obj);
        }
      });

      return value;
    }
  }),

  experimentalVersion:  C.EXPERIMENTAL_VERSIONS.RKE_K8S,

  willSave() {
    if ( get(this, 'registry') === 'custom' ) {
      const registry = {
        url:      get(this, 'registryUrl'),
        user:     get(this, 'registryUser'),
        password: get(this, 'registryPass'),
      }

      set(this, 'config.privateRegistries', [registry]);
    }

    return this._super(...arguments);
  },

  validate() {
    this._super(...arguments);

    let errors = get(this, 'errors') || [];

    if ( !get(this, 'isCustom') ) {
      errors.pushObjects(get(this, 'nodePoolErrors'));
    }

    if ( get(this, 'config.services.kubeApi.podSecurityPolicy') &&
        !get(this, 'cluster.defaultPodSecurityPolicyTemplateId') ) {
      errors.push(get(this, 'intl').t('clusterNew.psp.required'));
    }

    if (get(this, 'config.privateRegistries.length') >= 1) {
      let hasDefault = get(this, 'config.privateRegistries').findBy('isDefault') || false;

      if (!hasDefault) {
        errors.push(get(this, 'intl').t('cruPrivateRegistry.defaultError'));
      }
    }

    if (get(this, 'cluster.rancherKubernetesEngineConfig.services.etcd.snapshot')) {
      errors = this.validateEtcdService(errors);
    }

    const clusterOptErrors = get(this, 'clusterOptErrors') || [];

    if ( get(this, 'config.cloudProvider.name') === 'azure' ) {
      const intl = get(this, 'intl');

      Object.keys(AzureInfo).forEach((key) => {
        if ( get(AzureInfo, `${ key }.required`) && !get(this, `config.cloudProvider.azureCloudProvider.${ key }`) ) {
          errors.push(intl.t('validation.required', { key }));
        }
      });
    }

    set(this, 'errors', errors);

    return errors.length === 0 && clusterOptErrors.length === 0;
  },

  validateEtcdService(errors) {
    const etcdService             = get(this, 'cluster.rancherKubernetesEngineConfig.services.etcd') || {};
    const { creation, retention } = etcdService;
    const that = this;

    function checkDurationIsValid(duration, type) {
      // exact matching on these inputs
      // patternList = 12h12m12s || 12h12m || 12m12s  || 12h12s || 12h || 12m || 12s
      let patternList = [/^(\d+)(h)(\d+)(m)(\d+)(s)$/, /^(\d+)(h)(\d+)(m)$/, /^(\d+)(m)(\d+)(s)$/, /^(\d+)(h)(\d+)(s)$/, /^(\d+)(h)$/, /^(\d+)(m)$/, /^(\d+)(s)$/];
      let match       = patternList.filter( (p) => p.test(duration) );

      if (match.length === 0) {
        durationError(duration, type);
      }

      return;
    }

    function durationError(entry, type) {
      return errors.push(get(that, 'intl').t('clusterNew.rke.etcd.error', {
        type,
        entry
      }));
    }

    checkDurationIsValid(creation, 'Creation');
    checkDurationIsValid(retention, 'Reteintion');


    return errors;
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
    const cluster = get(this, 'cluster');

    setProperties(this, {
      step:    2,
      loading: true
    });

    return cluster.getOrCreateToken().then((token) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      setProperties(this, {
        token,
        loading: false
      });
    }).catch((err) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      get(this, 'growl').fromError('Error getting command', err);

      set(this, 'loading', false);
    });
  },

  findExcludedKeys(resourceFields) {
    Object.keys(resourceFields).forEach((key) => {
      const type = resourceFields[key].type;

      if ( type.startsWith('map[') ) {
        const t = type.slice(4, type.length - 1);
        const s = get(this, 'globalStore').getById('schema', t.toLowerCase());

        if ( s ) {
          const underlineKey = camelToUnderline(key);

          if ( EXCLUDED_KEYS.indexOf(underlineKey) === -1 ) {
            EXCLUDED_KEYS.push(underlineKey);
          }
        }
      }
    });
  },

  getResourceFields(type) {
    const schema = get(this, 'globalStore').getById('schema', type.toLowerCase());
    let resourceFields = null;

    if ( schema ) {
      resourceFields = get(schema, 'resourceFields');
      this.findExcludedKeys(resourceFields);
    }

    return resourceFields;
  },

  getFieldValue(field, type) {
    let resourceFields;
    const out = {};

    if ( type.startsWith('map[') ) {
      type = type.slice(4, type.length - 1);

      resourceFields = this.getResourceFields(type);

      if ( resourceFields ) {
        if ( field ) {
          Object.keys(field).forEach((key) => {
            out[camelToUnderline(key)] = this.getFieldValue(field[key], type);
          });

          return out;
        } else {
          return null;
        }
      } else {
        if ( field ) {
          Object.keys(field).forEach((key) => {
            out[camelToUnderline(key)] = field[key];
          });

          return out;
        } else {
          return null;
        }
      }
    } else if ( type.startsWith('array[') ) {
      type = type.slice(6, type.length - 1);

      resourceFields = this.getResourceFields(type);

      if ( resourceFields ) {
        return field ? field.map((item) => this.getFieldValue(item, type)) : null;
      } else {
        return field ? field.map((item) => item) : null;
      }
    } else {
      resourceFields = this.getResourceFields(type);

      if ( resourceFields ) {
        Object.keys(resourceFields).forEach((key) => {
          if ( !isEmpty(field) && (typeof field !== 'object' || Object.keys(field).length ) ) {
            out[camelToUnderline(key, type !== 'rkeConfigServices')] = this.getFieldValue(field[key], resourceFields[key].type);
          }
        });

        return out;
      } else {
        return field;
      }
    }
  },

  getSupportedFields(source, tragetField) {
    const out = {};
    const resourceFields = this.getResourceFields(tragetField);

    Object.keys(resourceFields).forEach((key) => {
      const field = get(source, key);
      const type = resourceFields[key].type;
      const value = this.getFieldValue(field, type);

      out[camelToUnderline(key)] = value;
    });

    return out;
  },

});
