import ClusterDriver from 'shared/mixins/cluster-driver';
import { equal, alias, or } from '@ember/object/computed';
import {
  get, set, computed, observer, setProperties, defineProperty
} from '@ember/object';
import { maxSatisfying } from 'shared/utils/parse-version';
import { inject as service } from '@ember/service';
import { underlineToCamel, removeEmpty, keysToCamel, validateEndpoint } from 'shared/utils/util';
import { validateHostname } from '@rancher/ember-api-store/utils/validate';
import { validateCertWeakly } from 'shared/utils/util';
import C from 'shared/utils/constants';
import YAML from 'yamljs';
import json2yaml from 'json2yaml';
import layout from './template';
import { resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import InputTextFile from 'ui/components/input-text-file/component';
import { scheduleOnce } from '@ember/runloop';
import { azure as AzureInfo } from 'shared/components/cru-cloud-provider/cloud-provider-info';
import moment from 'moment';
import ManageLabels from 'shared/mixins/manage-labels';
import { typeOf } from '@ember/utils';
import Semver, { major, minor }  from 'semver';

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

const EXCLUED_CLUSTER_OPTIONS = [
  'annotations',
  'labels'
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

const AVAILABLE_STRATEGIES = ['local', 's3'];

const {
  BACKEND_PORT,
  BACKEND_VNI,
  DEFAULT_BACKEND_TYPE,
} = C.NETWORK_CONFIG_DEFAULTS;


export default InputTextFile.extend(ManageLabels, ClusterDriver, {
  globalStore:               service(),
  settings:                  service(),
  growl:                     service(),
  intl:                      service(),
  clusterTemplates:          service(),

  layout,
  authChoices:               AUTHCHOICES,
  ingressChoices:            INGRESSCHOICES,
  availableStrategies:       AVAILABLE_STRATEGIES,

  configField:               'rancherKubernetesEngineConfig',
  registry:                  'default',
  accept:                    '.yml, .yaml',
  backupStrategy:            'local',
  overrideCreatLabel:        null,
  loading:                   false,
  pasteOrUpload:             false,
  model:                     null,
  initialVersion:            null,
  registryUrl:               null,
  registryUser:              null,
  registryPass:              null,
  clusterOptErrors:          null,
  nodeNameErrors:            null,

  existingNodes:             null,
  initialNodeCounts:         null,
  step:                      1,
  token:                     null,
  labels:                    null,
  etcd:                      false,
  controlplane:              false,
  worker:                    true,
  defaultDockerRootDir:      null,
  nodePoolErrors:            null,

  windowsEnable:             false,
  isLinux:                   true,
  windowsSupport:            false,
  weaveCustomPassword:       false,
  clusterTemplateCreate:     false,
  clusterTemplateQuestions:  null,
  forceExpandOnInit:         false,
  applyClusterTemplate:      null,
  useClusterTemplate:        false,
  clusterTemplateRevisionId: null,
  isNew:                     equal('mode', 'new'),
  isEdit:                    equal('mode', 'edit'),
  notView:                   or('isNew', 'isEdit'),
  clusterState:              alias('model.originalCluster.state'),

  // Custom stuff
  isCustom:                  equal('nodeWhich', 'custom'),

  init() {
    this._super();

    this.initNodeCounts();

    if (!this.useClusterTemplate && this.clusterTemplateRevisionId) {
      set(this, 'useClusterTemplate', true);
    }

    if (!this.applyClusterTemplate) {
      if ( get(this, 'isNew') ) {
        this.createRkeConfigWithDefaults();
      } else {
        this.initPrivateRegistries();

        this.initBackupConfigs();
      }

      scheduleOnce('afterRender', () => {
        this.initRootDockerDirectory();
      });
    }

    if ( get(this, 'isEdit') && get(this, 'primaryResource.isWindows') ) {
      set(this, 'windowsSupport', true)
    }
  },

  didReceiveAttrs() {
    if ( get(this, 'isEdit') && !get(this, 'clusterTemplateCreate')) {
      this.loadToken();
    }
  },

  actions: {
    addOverride(enabled, paramsToOverride, hideQuestion = false) {
      let {
        primaryResource,
        clusterTemplateQuestions      = [],
      }                               = this;
      let { path }                    = paramsToOverride;
      let question                    = null;
      let questionsSchemas            = [];
      let { clusterTemplateRevision } = this.model;

      if (clusterTemplateRevision && ( this.clusterTemplates.questionsSchemas || []).length > 0) {
        questionsSchemas = this.clusterTemplates.questionsSchemas;
      }

      if (enabled) {
        if (!clusterTemplateQuestions.findBy('variable', path)) {
          if (path === 'windowsSupport') {
            clusterTemplateQuestions.pushObjects(this.populateWindowsSupportOverrides(clusterTemplateQuestions, questionsSchemas, hideQuestion));
          } else if (path === 'backupStrategy') {
            question = questionsSchemas.findBy('variable', path);

            if (!question) {
              question = this.globalStore.createRecord({
                type:      'question',
                variable:  'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig',
                primaryResource,
              });
            }

            setProperties(question, {
              type: 'reference',
              hideQuestion
            });

            clusterTemplateQuestions.pushObject(question);
          } else {
            question = questionsSchemas.findBy('variable', path);

            if (question) {
              if (question.variable === 'rancherKubernetesEngineConfig.kubernetesVersion') {
                question = this.parseKubernetesVersionSemVer(primaryResource, question);
              }
            } else {
              question = this.globalStore.createRecord({
                type:      'question',
                variable:  path,
              });

              set(question, 'type', 'string');
            }

            setProperties(question, {
              primaryResource,
              isBuiltIn: true,
              hideQuestion
            });

            defineProperty(question, 'default', alias(`primaryResource.${ path }`));

            clusterTemplateQuestions.pushObject(question);
          }
        }
      } else {
        if (path === 'windowsSupport') {
          clusterTemplateQuestions.removeObjects(this.removeWindowsSupportOverrides(clusterTemplateQuestions));
        } else if (path === 'backupStrategy') {
          question = clusterTemplateQuestions.findBy('variable', 'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig');

          clusterTemplateQuestions.pushObject(question);
        } else {
          question = clusterTemplateQuestions.findBy('variable', path);

          clusterTemplateQuestions.removeObject(question);
        }
      }

      set(this, 'clusterTemplateQuestions', clusterTemplateQuestions);
    },

    setCpFields(configName, cloudProviderConfig) {
      set(this, `config.cloudProvider.${ configName }`, cloudProviderConfig);
    },

    cancel() {
      set(this, 'pasteOrUpload', false);
    },

    showPaste() {
      set(this, 'pasteOrUpload', true);
    },

    addRegistry(pr) {
      const config = get(this, 'config')

      if (( config.privateRegistries || [] ).length <= 0) {
        set(config, 'privateRegistries', [pr]);
      } else {
        config.privateRegistries.pushObject(pr);
      }
    },

    removeRegistry(pr) {
      get(this, 'config.privateRegistries').removeObject(pr);
    },
  },

  usingClusterTemplate: observer('useClusterTemplate', function() {
    if (!this.useClusterTemplate && this.clusterTemplateRevisionId) {
      set(this, 'clusterTemplateRevisionId', null);
    }
  }),

  driverDidChange: observer('nodeWhich', function() {
    this.createRkeConfigWithDefaults();
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

  strategyChanged: observer('backupStrategy', function() {
    const { backupStrategy, globalStore } = this;
    const services = this.config.services.clone();

    switch (backupStrategy) {
    case 'local':
      if (services) {
        setProperties(services.etcd, {
          backupConfig: globalStore.createRecord({
            type:           'backupConfig',
            s3BackupConfig: null,
            enabled:        get(services, 'etcd.backupConfig.enabled') || true,
          })
        });
      }
      break;
    case 's3':
      if (services) {
        setProperties(services.etcd, {
          backupConfig: globalStore.createRecord({
            type:           'backupConfig',
            s3BackupConfig: globalStore.createRecord({ type: 's3BackupConfig' }),
            enabled:        get(services, 'etcd.backupConfig.enabled') || true,
          })
        });
      }
      break;
    default:
      break;
    }

    set(this, 'config.services', services);
  }),

  allTemplates: computed('model.clusterTemplates.[]', 'model.clusterTemplateRevisions.[]', function() {
    const remapped = [];
    let { clusterTemplates, clusterTemplateRevisions } = this.model;

    clusterTemplateRevisions = clusterTemplateRevisions.filterBy('enabled');

    clusterTemplateRevisions.forEach((rev) => {
      let match = clusterTemplates.findBy('id', get(rev, 'clusterTemplateId'));

      if (match) {
        remapped.pushObject({
          clusterTemplateId:           get(match, 'id'),
          clusterTemplateName:         get(match, 'displayName'),
          clusterTemplateRevisionId:   get(rev, 'id'),
          clusterTemplateRevisionName: get(rev, 'name'),
        });
      }
    });

    return remapped;
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

  versionChoices: computed(`settings.${ C.SETTING.VERSIONS_K8S }`, function() {
    let out = JSON.parse(get(this, `settings.${ C.SETTING.VERSIONS_K8S }`) || '{}');

    out = Object.keys(out);

    let patchedOut = out.map((version) => {
      return `${ major(version) }.${ minor(version) }.x`;
    });

    return [...out, ...patchedOut];
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

  newNodeCount: computed('initialNodeCounts', 'primaryResource.id', 'existingNodes.@each.clusterId', function() {
    let clusterId = get(this, 'primaryResource.id');
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

      if ( nodeName ) {
        addressCmd += ` -nodeName ${ nodeName.toLowerCase() }`;
      }

      if (address) {
        addressCmd += ` -address ${ address }`
      }

      if (internalAddress) {
        addressCmd += ` -internalAddress ${ internalAddress }`
      }

      const labelKeys = Object.keys(labels);

      if ( get(labelKeys, 'length') > 0 ) {
        addressCmd += ` -label `;
        const labelArray = [];

        labelKeys.forEach((key) => {
          labelArray.push(`${ key }=${ labels[key] }`);
        });
        addressCmd += `${ labelArray.join(',') }`;
      }

      if (addressCmd) {
        out = out.replace(`; if($?)`, `${ addressCmd }; if($?)`)
      }
    }

    return out;
  }),

  yamlValue: computed('pasteOrUpload', {
    get() {
      const intl = get(this, 'intl');

      let config = this.getSupportedFields(get(this, 'config'), 'rancherKubernetesEngineConfig');

      if ( !config ) {
        return '';
      }

      let cluster    = this.getSupportedFields(get(this, 'primaryResource'), 'cluster', EXCLUED_CLUSTER_OPTIONS);
      const cpConfig = JSON.parse(JSON.stringify(get(cluster, 'rancher_kubernetes_engine_config.cloud_provider')));

      delete cluster.rancher_kubernetes_engine_config

      Object.assign(config, cluster)

      config = removeEmpty(config, EXCLUDED_KEYS);

      while ( JSON.stringify(config) !== JSON.stringify(removeEmpty(config, EXCLUDED_KEYS)) ){
        config = removeEmpty(config, EXCLUDED_KEYS);
      }

      if ( config.cloud_provider && get(this, 'nodeWhich') === 'azure' ) {
        // this is a quick and dirty fix for azure only because it is currently the only cp that works
        // this whole process will be recieving updates shortly so this is a temp fix
        // client_id, secret, & subscription_id are all required so ensure they are there on NEW when a user has entered them but switched to yaml or edit
        // removeEmpty works great except for these fields and adding nested paths doesn't work in removeEmpty
        Object.assign(config.cloud_provider.azureCloudProvider, {
          'aad_client_cert_password': cpConfig.azureCloudProvider.aad_client_cert_password || '',
          'aad_client_id':            cpConfig.azureCloudProvider.aad_client_id || '',
          'aad_client_secret':        cpConfig.azureCloudProvider.aad_client_secret || '',
          'tenant_id':                cpConfig.azureCloudProvider.tenant_id || '',
          'subscription_id':          cpConfig.azureCloudProvider.subscription_id || '',
        });
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
      const clusterFields = this.getResourceFields('cluster');
      const clusterKeys = [];

      Object.keys(clusterFields).filter((key) => clusterFields[key].update && key !== 'rancher_kubernetes_engine_config').forEach((key) => {
        clusterKeys.push(camelToUnderline(key));
      });

      Object.keys(configs || {}).forEach((key) => {
        if ( validFields[underlineToCamel(key)] || clusterFields[underlineToCamel(key)] ) {
          if (configs[key] === null) {
            return
          }
          let obj;

          if ( key === 'network' ) {
            obj = keysToCamel(configs[key], ['options']);
          } else {
            obj = keysToCamel(configs[key]);
          }

          if ( clusterKeys.includes(key) ) {
            set(this, `primaryResource.${ underlineToCamel(key) }`, obj)

            return
          }

          if ( key === 'services' && obj['kube-api'] ) {
            set(obj, 'kubeApi', obj['kube-api']);
            delete obj['kube-api'];
          }

          if ( key === 'services' && obj['kube-controller'] ) {
            set(obj, 'kubeController', obj['kube-controller']);
            delete obj['kube-controller'];
          }

          set(this, `config.${ underlineToCamel(key) }`, obj);
        }
      });

      return value;
    }
  }),

  buildClusterAnswersFromConfig(cluster, questions) {
    let answers = {};

    if (questions && questions.length) {
      questions.forEach((quest) => {
        let match = get(cluster, quest.variable);

        if (match) {
          answers[quest.variable] = match;
        }
      });
    }

    return answers;
  },

  willSave() {
    const { cluster, configField: field } = this;

    this.checkKubernetesVersionSemVer();

    if (typeOf(cluster.clearProvidersExcept) === 'function' || this.applyClusterTemplate && typeOf(cluster.buildClusterAnswersFromConfig) === 'function') {
      if (this.applyClusterTemplate) {
        // need to add overrides + user entry to answers on cluster, drop rkeconfig
        let answers = this.buildClusterAnswersFromConfig(cluster, get(this, 'model.clusterTemplateRevision.questions'));

        // clearConfigFieldsForClusterTemplate
        this.cluster.clearConfigFieldsForClusterTemplate();

        set(cluster, 'answers', { values: answers });
      } else {
        cluster.clearProvidersExcept(field);
      }
    }

    if (get(cluster, 'localClusterAuthEndpoint')) {
      if (!get(cluster, 'rancherKubernetesEngineConfig') || isEmpty(get(cluster, 'rancherKubernetesEngineConfig'))) {
        delete cluster.localClusterAuthEndpoint;
      }
    }

    set(this, 'errors', null);

    // return this.validate();
    return true;
  },

  validate() {
    this._super(...arguments);

    let errors = [];
    let config = get(this, `config`);

    if ( !get(this, 'isCustom') ) {
      errors.pushObjects(get(this, 'nodePoolErrors'));
    }

    if ( get(config, 'services.kubeApi.podSecurityPolicy') &&
         !get(this, 'primaryResource.defaultPodSecurityPolicyTemplateId') ) {
      errors.push(get(this, 'intl').t('clusterNew.psp.required'));
    }

    if (get(this, 'config.services.etcd.snapshot')) {
      errors = this.validateEtcdService(errors);
    }

    if ( get(this, 'primaryResource.localClusterAuthEndpoint.enabled') ) {
      errors = this.validateAuthorizedClusterEndpoint(errors);
    }

    const clusterOptErrors = get(this, 'clusterOptErrors') || [];

    if ( get(config, 'cloudProvider.name') === 'azure' ) {
      const intl = get(this, 'intl');

      Object.keys(AzureInfo).forEach((key) => {
        if ( get(AzureInfo, `${ key }.required`) && !get(config, `cloudProvider.azureCloudProvider.${ key }`)) {
          if ( this.isNew || this.isEdit && key !== 'aadClientSecret' ) {
            errors.push(intl.t('validation.required', { key }));
          }
        }
      });
    }

    set(this, 'errors', errors);

    return errors.length === 0 && clusterOptErrors.length === 0;
  },

  validateAuthorizedClusterEndpoint(errors) {
    let { localClusterAuthEndpoint } = get(this, 'primaryResource');
    let { caCerts, fqdn } = localClusterAuthEndpoint;

    if (caCerts) {
      if (!validateCertWeakly(caCerts) ) {
        errors.push(this.intl.t('newCertificate.errors.cert.invalidFormat'));
      }
    }

    if (fqdn) {
      errors = validateHostname(fqdn, 'FQDN', get(this, 'intl'), { restricted: true }, errors);
    }

    return errors;
  },

  validateEtcdService(errors) {
    const etcdService             = get(this, 'config.services.etcd') || {};
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

  doneSaving(neu) {
    let { close } = this;

    if ( get(this, 'isCustom') ) {
      if ( get(this, 'isEdit') ) {
        if (close) {
          close(neu);
        }
      } else {
        this.loadToken();
      }
    } else {
      if (close) {
        close(neu);
      }
    }

    return resolve();
  },

  loadToken() {
    const cluster = get(this, 'primaryResource');

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

  getSupportedFields(source, tragetField, excludeFields = []) {
    const out = {};
    const resourceFields = this.getResourceFields(tragetField);

    Object.keys(resourceFields).filter((key) => resourceFields[key].update && excludeFields.indexOf(key) === -1).forEach((key) => {
      const field = get(source, key);
      const type = resourceFields[key].type;
      const value = this.getFieldValue(field, type);

      out[camelToUnderline(key)] = value;
    });

    return out;
  },

  initNodeCounts() {
    const counts = {};

    set(this, 'existingNodes', this.globalStore.all('node'));

    this.globalStore.findAll('node').then((all) => {
      all.forEach((node) => {
        const id = get(node, 'clusterId');

        counts[id] = (counts[id] || 0) + 1;
      });

      this.notifyPropertyChange('initialNodeCounts');
    });

    setProperties(this, {
      initialNodeCounts: counts,
      initialVersion:    get(this, 'config.kubernetesVersion')
    })
  },

  initPrivateRegistries() {
    const config = get(this, 'config');

    if ( get(config, 'privateRegistries.length') > 0 ) {
      const registry = get(config, 'privateRegistries.firstObject');

      setProperties(this, {
        registry:     'custom',
        registryUrl:  get(registry, 'url'),
        registryUser: get(registry, 'user'),
        registryPass: get(registry, 'password'),
      });
    }
  },

  createRkeConfigWithDefaults() {
    const { globalStore, versionChoices, } = this;
    const defaultVersion                   = get(this, `settings.${ C.SETTING.VERSION_SYSTEM_K8S_DEFAULT_RANGE }`);
    const satisfying                       = maxSatisfying(versionChoices, defaultVersion);
    const out                              = {};

    const rkeConfig = globalStore.createRecord({
      type:                'rancherKubernetesEngineConfig',
      ignoreDockerVersion: true,
      kubernetesVersion:   satisfying,
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
          type:         'etcdService',
          snapshot:     false,
          backupConfig: globalStore.createRecord({
            type:    'backupConfig',
            enabled: true,
          }),
          extraArgs:    {
            'heartbeat-interval': 500,
            'election-timeout':   5000
          },
        }),
      }),
    });

    setProperties(out, {
      rancherKubernetesEngineConfig: rkeConfig,
      enableNetworkPolicy:           false
    });

    if (this.isNew) {
      set(out, 'localClusterAuthEndpoint', globalStore.createRecord({
        type:    'localClusterAuthEndpoint',
        enabled: true
      }));
    }

    scheduleOnce('afterRender', () => {
      setProperties(this.primaryResource, out);

      this.notifyPropertyChange('config');
    });
  },

  migrateLegacyEtcdSnapshotSettings() {
    const { config } = this;
    let {
      retention, creation, backupConfig
    } = config.services.etcd;

    let creationMatch = creation.match(/^((\d+)h)?((\d+)m)?((\d+)s)?$/);
    let momentReady   = [creationMatch[2], creationMatch[4], creationMatch[6]];

    if (momentReady[1] && momentReady[1] < 30) {
      // round min down since new settting is in intval hours
      momentReady[1] = 0;
    } else  if (momentReady[1] && momentReady[1] >= 30) {
      // round up to the nearest hour
      momentReady[0] = parseInt(momentReady[0], 10) + 1;
      momentReady[1] = 0;
    }

    if (( !momentReady[0] || momentReady[0] === 0 ) && momentReady[1] === 0) {
      // if both hours and min are zero set hour to 1;
      momentReady[0] = 1;
    }

    let toMoment      = {
      hours:   momentReady[0] ? momentReady[0] : 0,
      minutes: momentReady[1] ? momentReady[1] : 0,
      seconds: momentReady[2] ? momentReady[2] : 0,
    };

    const parsedDurationAsHours = moment.duration(toMoment).hours();

    setProperties(this, {
      legacyRetention:           retention,
      hasLegacySnapshotSettings: true,
    });

    if (backupConfig) {
      setProperties(config.services.etcd, {
        'backupConfig.enabled':       true,
        'backupConfig.intervalHours': parsedDurationAsHours,
        snapshot:                     false,
      });
    } else {
      backupConfig = this.globalStore.createRecord({
        type:          'backupConfig',
        intervalHours: parsedDurationAsHours,
        enabled:       true,
      });

      setProperties(config.services.etcd, {
        backupConfig,
        snapshot: false,
      });
    }
  },

  initRootDockerDirectory() {
    set(this, 'defaultDockerRootDir', get(this.globalStore.getById('schema', 'cluster').getCreateDefaults(), 'dockerRootDir'))
  },


  initBackupConfigs() {
    const etcd = get(this, 'config.services.etcd');

    if (etcd) {
      if (etcd.snapshot) {
        this.migrateLegacyEtcdSnapshotSettings();
      } else if (etcd.backupConfig && etcd.backupConfig.s3BackupConfig) {
        set(this, 'backupStrategy', 's3');
      } else if (!etcd.snapshot && !etcd.backupConfig) {
        const backupConfig = get(this, 'globalStore').createRecord({
          enabled: false,
          type:    'backupConfig',
        });

        set(etcd, 'backupConfig', backupConfig)
      }
    }
  },

  populateWindowsSupportOverrides(overrides, questionsSchemas = [], hideQuestion = false) {
    let cloned    = overrides.slice();
    let deefaults = {
      'network.options.flannel_backend_port': BACKEND_PORT,
      'network.options.flannel_backend_vni':  BACKEND_VNI
    };

    Object.keys(deefaults).forEach((defKey) => {
      let question = questionsSchemas.findBy('variable', `rancherKubernetesEngineConfig.${ defKey }`);

      if (!question) {
        question = this.globalStore.createRecord({
          type:            'question',
          variable:        `rancherKubernetesEngineConfig.${ defKey }`,
          primaryResource: this.primaryResource,
          default:         deefaults[defKey],
          hideQuestion,
        });

        // use question type to get the right schema defaults but type is actually the type of the answer in this case.
        set(question, 'type', 'int');
      }

      if (!overrides.findBy('variable', question.variable)) {
        cloned.pushObject(question)
      }
    });

    return cloned;
  },

  removeWindowsSupportOverrides(overrides) {
    let deefaults = [
      'network.options.flannel_backend_port',
      'network.options.flannel_backend_vni'
    ];

    return overrides.slice().filter((ovr) => {
      return !deefaults.includes(get(ovr, 'variable'));
    });
  },

  checkKubernetesVersionSemVer() {
    let {
      clusterTemplateCreate = false,
      config : { kubernetesVersion },
      model: { clusterTemplateRevision: { questions = [] } }
    } = this;
    const kubernetesVersionOverrideExists = questions.findBy('variable', 'rancherKubernetesEngineConfig.kubernetesVersion');

    if (clusterTemplateCreate) {
      if (kubernetesVersionOverrideExists) {
        if (kubernetesVersionOverrideExists.satisfies) {
          // we have a user defined override and this means we dont need satisfies because it can be anything
          delete kubernetesVersionOverrideExists.satisfies;
        }
      } else {
        if (kubernetesVersion.endsWith('x')) {
          this.send('addOverride', true, { path: 'rancherKubernetesEngineConfig.kubernetesVersion' }, true);
        }
      }
    }
  },

  parseKubernetesVersionSemVer(cluster, question) {
    let { kubernetesVersion } = cluster.rancherKubernetesEngineConfig;
    let coercedVersion        = Semver.coerce(kubernetesVersion);
    let satisfies             = `>=${ coercedVersion.major }.${ coercedVersion.minor }.${ coercedVersion.patch } <${ coercedVersion.major }.${ coercedVersion.minor + 1 }`

    set(question, 'satisfies', satisfies);

    return question;
  },
});
