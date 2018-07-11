import ClusterDriver from 'shared/mixins/cluster-driver';
import {
  equal, alias, or
} from '@ember/object/computed';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { satisfies } from 'shared/utils/parse-version';
import { sortVersions } from 'shared/utils/sort';
import { inject as service } from '@ember/service';
import {
  camelToUnderline, underlineToCamel, removeEmpty, keysToCamel, validateEndpoint
} from 'shared/utils/util';
import C from 'shared/utils/constants';
import YAML from 'npm:yamljs';
import json2yaml from 'npm:json2yaml';
import layout from './template';
import { resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import InputTextFile from 'ui/components/input-text-file/component';
import { scheduleOnce } from '@ember/runloop';

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
  globalStore:    service(),
  settings:       service(),
  growl:          service(),
  intl:           service(),

  layout,
  networkChoices: NETWORKCHOICES,
  authChoices:    AUTHCHOICES,
  ingressChoices: INGRESSCHOICES,

  configField:      'rancherKubernetesEngineConfig',
  registry:         'default',
  accept:           '.yml, .yaml',
  loading:          false,
  pasteOrUpload:    false,
  model:            null,
  initialVersion:   null,
  registryUrl:      null,
  registryUser:     null,
  registryPass:     null,
  clusterOptErrors: null,

  existingNodes:     null,
  initialNodeCounts: null,
  step:              1,
  token:             null,
  labels:            null,
  etcd:              false,
  controlplane:      false,
  worker:            true,

  isNew:          equal('mode', 'new'),
  isEdit:         equal('mode', 'edit'),
  notView:        or('isNew', 'isEdit'),
  clusterState:   alias('model.originalCluster.state'),
  // Custom stuff
  isCustom:          equal('nodeWhich', 'custom'),
  versionChoices: computed('initialVersion', `settings.${ C.SETTING.VERSIONS_K8S }`, 'config.kubernetesVersion', function() {

    const versions = JSON.parse(get(this, `settings.${ C.SETTING.VERSIONS_K8S }`) || '{}');

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

    if (get(this, 'editing') &&  !out.includes(initialVersion) ) {

      out.unshift(initialVersion);

    }

    return sortVersions(out).reverse()
      .map((v) => {

        return { value: v }

      });

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

  command: computed('labels', 'token.nodeCommand', 'etcd', 'controlplane', 'worker', 'address', 'internalAddress', function() {

    let out = get(this, 'token.nodeCommand');

    if ( !out ) {

      return;

    }

    const address         = get(this, 'address');
    const internalAddress = get(this, 'internalAddress');
    const roles           = ['etcd', 'controlplane', 'worker'];
    const labels          = get(this, 'labels') || {};

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

    return out;

  }),

  value: computed('pasteOrUpload', {

    get() {

      const intl = get(this, 'intl');

      let config = this.getSupportedFields(get(this, 'cluster.rancherKubernetesEngineConfig'), 'rancherKubernetesEngineConfig');

      if ( !config ) {

        return '';

      }

      config = removeEmpty(config);

      while ( JSON.stringify(config) !== JSON.stringify(removeEmpty(config)) ){

        config = removeEmpty(config);

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

          set(this, `cluster.rancherKubernetesEngineConfig.${ underlineToCamel(key) }`, keysToCamel(configs[key]));

        }

      });

      return value;

    }
  }),
  driverDidChange: observer('nodeWhich', function() {

    if ( !get(this, 'isNew') ) {

      return;

    }

    const config = get(this, 'cluster.rancherKubernetesEngineConfig');

    if ( config && get(config, 'cloudProvider') ){

      delete config.cloudProvider;

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

  init() {

    this._super();

    const globalStore = get(this, 'globalStore');
    const counts = {};

    let rkeConfig = null;

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


    if ( !get(this, 'isEdit') ) {

      const globalStore = get(this, 'globalStore');

      rkeConfig = globalStore.createRecord({
        type:                'rancherKubernetesEngineConfig',
        ignoreDockerVersion: true,
        kubernetesVersion:   get(this, `settings.${ C.SETTING.VERSION_K8S_DEFAULT }`),
        authentication:      globalStore.createRecord({
          type:     'authnConfig',
          strategy: 'x509',
        }),
        network: globalStore.createRecord({
          type:   'networkConfig',
          plugin: 'canal',
        }),
        ingress: globalStore.createRecord({
          type:     'ingressConfig',
          provider: 'nginx',
        }),
        services: globalStore.createRecord({
          type:    'rkeConfigServices',
          kubeApi: globalStore.createRecord({
            type:              'kubeAPIService',
            podSecurityPolicy: false,
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

    }

    scheduleOnce('afterRender', () => {

      if (rkeConfig) {

        set(this, 'cluster.rancherKubernetesEngineConfig', rkeConfig);

      }

      if ( get(this, 'isNew') ) {

        this.driverDidChange();

      }

    })

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
    const errors = get(this, 'errors') || [];

    if ( !get(this, 'isCustom') ) {

      errors.pushObjects(get(this, 'nodePoolErrors'));

    }

    if ( get(this, 'config.services.kubeApi.podSecurityPolicy') &&
        !get(this, 'cluster.defaultPodSecurityPolicyTemplateId') ) {

      errors.push(get(this, 'intl').t('clusterNew.psp.required'));

    }

    const clusterOptErrors = get(this, 'clusterOptErrors') || [];

    set(this, 'errors', errors);

    return errors.length === 0 && clusterOptErrors.length === 0;

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

    })
      .catch((err) => {

        if ( this.isDestroyed || this.isDestroying ) {

          return;

        }

        get(this, 'growl').fromError('Error getting command', err);

        set(this, 'loading', false);

      });

  },

  getResourceFields(type) {

    const schema = get(this, 'globalStore').getById('schema', type.toLowerCase());

    return schema ? get(schema, 'resourceFields') : null;

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

            out[camelToUnderline(key)] = this.getFieldValue(field[key], resourceFields[key].type);

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
