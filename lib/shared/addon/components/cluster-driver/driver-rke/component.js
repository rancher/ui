import {
  computed, defineProperty, get, observer, set, setProperties
} from '@ember/object';
import { alias, equal, or } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { next, once, scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty, typeOf } from '@ember/utils';
import { validateHostname } from 'ember-api-store/utils/validate';
import deepSet from 'ember-deep-set';
import jsyaml from 'js-yaml';
import moment from 'moment';
import { resolve } from 'rsvp';
import Semver, { major, minor } from 'semver';
import { azure as AzureInfo } from 'shared/components/cru-cloud-provider/cloud-provider-info';
import ClusterDriver from 'shared/mixins/cluster-driver';
import ManageLabels from 'shared/mixins/manage-labels';
import C from 'shared/utils/constants';
import { coerceVersion, maxSatisfying, satisfies } from 'shared/utils/parse-version';
import {
  keysToCamel, keysToDecamelize, randomStr, removeEmpty, ucFirst, validateCertWeakly
} from 'shared/utils/util';
import InputTextFile from 'ui/components/input-text-file/component';
import layout from './template';

const EXCLUDED_KEYS = ['name'];
const EXCLUDED_CHILDREN_KEYS = ['extra_args', 'nodelocal', 'dns', 'extraArgs'];

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
  CLUSTER_TEMPLATE_IGNORED_OVERRIDES,
  NETWORK_CONFIG_DEFAULTS: { DEFAULT_BACKEND_TYPE }
} = C;

const { WEAVE } = C.NETWORK_CONFIG_DEFAULTS;

export default InputTextFile.extend(ManageLabels, ClusterDriver, {
  globalStore:               service(),
  settings:                  service(),
  growl:                     service(),
  intl:                      service(),
  clusterTemplates:          service(),
  access:                    service(),
  router:                    service(),
  cisHelpers:                service(),
  features:                  service(),

  layout,
  authChoices:               AUTHCHOICES,
  ingressChoices:            INGRESSCHOICES,
  availableStrategies:       AVAILABLE_STRATEGIES,
  ingornedRkeOverrides:      CLUSTER_TEMPLATE_IGNORED_OVERRIDES,

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

  existingNodes:             null,
  initialNodeCounts:         null,
  step:                      1,
  token:                     null,
  taints:                    null,
  labels:                    null,
  etcd:                      false,
  controlplane:              false,
  worker:                    true,
  defaultDockerRootDir:      null,
  nodePoolErrors:            null,

  windowsEnable:             false,
  isLinux:                   true,
  weaveCustomPassword:       false,
  clusterTemplateCreate:     false,
  clusterTemplateQuestions:  null,
  forceExpandOnInit:         false,
  forceExpandAll:            false,
  applyClusterTemplate:      null,
  useClusterTemplate:        false,
  clusterTemplatesEnforced:  false,
  selectedClusterTemplateId: null,
  upgradeStrategy:           null,
  scheduledClusterScan:      null,
  isWindowsPreferedCluster:  false,

  isPostSave: false,

  isNew:                        equal('mode', 'new'),
  isEdit:                       equal('mode', 'edit'),
  notView:                      or('isNew', 'isEdit'),
  clusterState:                 alias('model.originalCluster.state'),
  // Custom stuff
  isCustom:                  equal('nodeWhich', 'custom'),

  isScheduledClusterScanDisabled: alias('model.cluster.windowsPreferedCluster'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      upgradeStrategy:           {},
      scheduledClusterScan:      { enabled: false },
    })

    this.initNodeCounts();
    if (!this.useClusterTemplate && this.model.cluster.clusterTemplateRevisionId) {
      setProperties(this, {
        useClusterTemplate:        true,
        forceExpandOnInit:         true,
        selectedClusterTemplateId: this.cluster.clusterTemplateId,
      });
    }

    if (this.applyClusterTemplate) {
      if (this.useClusterTemplate) {
        this.initTemplateCluster();
      } else {
        this.initNonTemplateCluster();
      }
    } else {
      if (this.model.cluster.clusterTemplateRevisionId && this.router.currentRouteName !== 'global-admin.cluster-templates.new') {
        this.initTemplateCluster();
      } else {
        this.initNonTemplateCluster();

        if (this.clusterTemplateCreate && this.clusterTemplateQuestions && this.clusterTemplateQuestions.length > 0) {
          // cloned
          this.clusterTemplateQuestions.forEach((q) => {
            this.send('addOverride', true, { path: q.variable });
          })
        }
      }
    }
    setProperties(this, {
      scheduledClusterScan: {
        enabled:        false,
        scheduleConfig: {
          cronSchedule: '0 0 * * *',
          retention:    24
        },
        scanConfig: {
          cisScanConfig: {
            failuresOnly:             false,
            skip:                     null,
            profile:                  null,
            overrideBenchmarkVersion: null
          }
        }
      },
      upgradeStrategy:           {
        maxUnavailableControlplane: '',
        maxUnavailableWorker:       '',
        drain:                      'false',
        nodeDrainInput:             {}
      },
    });
    // This needs to be scheduled after render in order to wait for initTemplateCluster to setup the rkeconfig defaults.
    scheduleOnce('afterRender', this, this.setupComponent);
  },

  didReceiveAttrs() {
    if (this.applyClusterTemplate) {
      if (this.useClusterTemplate) {
        this.initTemplateCluster();
      } else {
        if (!this.clusterTemplateCreate && isEmpty(this.cluster.rancherKubernetesEngineConfig)) {
          this.initNonTemplateCluster();
        }
      }
    }

    if (this.useClusterTemplate && this.model.cluster.clusterTemplateRevisionId) {
      set(this, 'forceExpandAll', true);
    }
  },

  actions: {
    fileUploaded() {
      let { yamlValue } = this;

      next(() => {
        set(this, 'clusterOptErrors', this.checkYamlForRkeConfig(yamlValue));
      });
    },

    yamlValUpdated(yamlValue, codeMirror) {
      if (!this.codeMirror) {
        codeMirror.on('paste', this.pastedYaml.bind(this));
      }
      // this fires when we first change over so here is where you can set the paste watcher to validate
      setProperties(this, {
        yamlValue,
        codeMirror
      });
    },

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
          if (path.startsWith('uiOverride')) {
            question = questionsSchemas.findBy('variable', path);

            if (!question) {
              question = this.globalStore.createRecord({
                type:      'question',
                variable:  path,
                primaryResource,
              });
            }

            hideQuestion = true;

            setProperties(question, {
              type:    'boolean',
              default: true,
              hideQuestion
            });

            clusterTemplateQuestions.pushObject(question);
          } else {
            question = questionsSchemas.findBy('variable', path);

            if (question) {
              if (question.variable === 'rancherKubernetesEngineConfig.kubernetesVersion') {
                question = this.parseKubernetesVersionSemVer(primaryResource, question);
              }

              if (question.variable.includes('azureCloudProvider')) {
                let cloudProviderMatch = AzureInfo[(question.variable.split('.') || []).lastObject];

                if (cloudProviderMatch) {
                  let {
                    required = false,
                    type = 'string'
                  } = cloudProviderMatch;

                  question = this.globalStore.createRecord({
                    type:      'question',
                    variable:  path,
                  });

                  setProperties(question, {
                    required,
                    type,
                  });

                  if (required) {
                    set(question, 'forceRequired', true);
                  }
                }
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

            if (path.includes('rancherKubernetesEngineConfig.privateRegistries[0]')) {
              // need to replace the array target with built in first object so the alias works
              path = path.replace('[0]', '.firstObject');
            }

            defineProperty(question, 'default', alias(`primaryResource.${ path }`));

            clusterTemplateQuestions.pushObject(question);
          }
        } else {
          // we've found the template override this wires up the value displayed in overrides section to the form value
          question = clusterTemplateQuestions.findBy('variable', path);

          setProperties(question, {
            primaryResource,
            isBuiltIn: true,
            hideQuestion
          });

          defineProperty(question, 'default', alias(`primaryResource.${ path }`));
        }
      } else {
        if (path === 'uiOverrideBackupStrategy') {
          question = clusterTemplateQuestions.findBy('variable', 'rancherKubernetesEngineConfig.services.etcd.backupConfig.s3BackupConfig');

          clusterTemplateQuestions.removeObject(question);
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
      const newOpts = this.getOptsFromYaml();

      if (newOpts) {
        if (this.updateFromYaml && this.mode !== 'view') {
          this.updateFromYaml(newOpts);
          setProperties(this, {
            clusterOptErrors: [],
            pasteOrUpload:    false,
          });
        }
      } else {
        if (isEmpty(this.clusterOptErrors)) {
          set(this, 'pasteOrUpload', false);
        }
      }
    },

    showPaste() {
      if (!this.configBeforeYaml) {
        // need to store off a raw non-referneced version of the og config
        // if a user switches back to form view and then comes back to yaml to
        // move something to a lower indent or remove we want to only add whats in
        // the orignal config and waht is in the yaml.
        // add the key bloop: true to yaml, sswitch to form, wait no i want bloop nested under something else, comeback and move it, now you have two keys, one at root and dupe at new nest
        set(this, 'configBeforeYaml', this.primaryResource.clone());
      }
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

    setTaints(taints) {
      set(this, 'taints', taints);
    }
  },

  windowsPreferedClusterChanged: observer('model.cluster.windowsPreferedCluster', function() {
    if (get(this, 'model.cluster.windowsPreferedCluster')) {
      set(this, 'scheduledClusterScan.enabled', 'false');
    }
  }),

  usingClusterTemplate: observer('useClusterTemplate', function() {
    if (!this.useClusterTemplate && this.model.cluster.clusterTemplateRevisionId) {
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

  onCisScanBenchmarksUpdated: observer('cisHelpers.cisScanBenchmarks.[]', function() {
    this.initScheduledClusterScan();
  }),

  enforcementChanged: on('init', observer('settings.clusterTemplateEnforcement', function() {
    let {
      access:   { me: { hasAdmin: globalAdmin = null } },
      settings: { clusterTemplateEnforcement = false }
    } = this;
    let useClusterTemplate = false;

    if (!globalAdmin) {
      // setting is string value
      if (clusterTemplateEnforcement === 'true') {
        clusterTemplateEnforcement = true;
      } else {
        clusterTemplateEnforcement = false;
      }

      if (this.applyClusterTemplate) {
        if (clusterTemplateEnforcement) {
          useClusterTemplate = true;
        } else if (this.model.cluster.clusterTemplateRevisionId) {
          useClusterTemplate = true;
        }
      } else if (!this.applyClusterTemplate && clusterTemplateEnforcement) {
        useClusterTemplate = true;
      } else {
        if (this.model.cluster.clusterTemplateRevisionId) {
          useClusterTemplate = true;
        }
      }

      setProperties(this, {
        useClusterTemplate,
        clusterTemplatesEnforced: clusterTemplateEnforcement
      });
    }
  })),

  agentEnvVars: computed('cluster.agentEnvVars.[]', {
    get() {
      if (!this.cluster?.agentEnvVars) {
        // if undefined two way binding doesn't seem to work
        set(this, 'cluster.agentEnvVars', []);
      }

      return get(this, 'cluster.agentEnvVars') || [];
    },
    set(_key, value) {
      set(this, 'cluster.agentEnvVars', value);

      return value;
    },
  }),

  maxUnavailable: computed('upgradeStrategy.maxUnavailableUnit', 'upgradeStrategy.maxUnavailableWorker', function() {
    const value = { value: get(this, 'upgradeStrategy.maxUnavailableWorker') };

    const isPercentageUnits = get(this, 'upgradeStrategy.maxUnavailableUnit') === 'percentage';

    // Strip off the % at the end of the value, as we will add it again when we format it
    if (isPercentageUnits && (typeof value.value === 'string')) {
      const PERCENT_REGEX = /%+$/;

      value.value = value.value.replace(PERCENT_REGEX, '');
    }

    return isPercentageUnits
      ? get(this, 'intl').t('clusterNew.rke.upgradeStrategy.maximumWorkersDown.view.percentage', value)
      : get(this, 'intl').t('clusterNew.rke.upgradeStrategy.maximumWorkersDown.view.count', value)
  }),

  showUpgradeK8s21Warning: computed('initialVersion', 'config.kubernetesVersion', function() {
    const isLegacyEnabled = get(this, 'features').isFeatureEnabled(C.FEATURES.LEGACY)

    if (!isLegacyEnabled) {
      return false;
    }

    const selectedVersion = coerceVersion(get(this, 'config.kubernetesVersion'));

    return Semver.satisfies(selectedVersion, '>=1.21.0');
  }),

  showUpgradeK8sWarning: computed(
    'selectedClusterTemplateId',
    'applyClusterTemplate',
    'initialVersion',
    'model.clusterTemplateRevision.clusterConfig.rancherKubernetesEngineConfig.kubernetesVersion',
    function() {
      const {
        applyClusterTemplate,
        initialVersion,
        isEdit,
      } = this;
      const ctrK8sVersion = get(this, 'model.clusterTemplateRevision.clusterConfig.rancherKubernetesEngineConfig.kubernetesVersion');

      try {
        if (isEdit && applyClusterTemplate) {
          if (initialVersion && ctrK8sVersion && Semver.lt(initialVersion, ctrK8sVersion)) {
            return true;
          }
        }
      } catch (err) {
        return false;
      }

      return false;
    }),

  filteredClusterTemplates: computed('model.clusterTemplates.@each.{id,state,name,members}', function() {
    let { model: { clusterTemplates = [] } } = this;

    let mapped = clusterTemplates.map((clusterTemplate) => {
      return {
        name: clusterTemplate.name,
        id:   clusterTemplate.id,
      }
    });

    return mapped.sortBy('created').reverse();
  }),

  maxUnavailableNodesOptions: computed(function() {
    return [
      {
        name: this.intl.t('clusterNew.rke.upgradeStrategy.maximumWorkersDown.mode.percentage'),
        id:   'percentage'
      },
      {
        name: this.intl.t('clusterNew.rke.upgradeStrategy.maximumWorkersDown.mode.count'),
        id:   'count'
      }
    ];
  }),

  filteredTemplateRevisions: computed('cluster.type', 'isEdit', 'model.clusterTemplateRevisions.@each.{id,members,name,state}', 'selectedClusterTemplateId', 'setDefaultRevisionId', function() {
    let {
      selectedClusterTemplateId,
      clusterTemplateRevisionId = null,
      model: {
        clusterTemplateRevisions,
        clusterTemplates,
      },
      originalCluster,
      intl
    } = this;
    let clusterTemplate;

    clusterTemplateRevisions = clusterTemplateRevisions.slice().filterBy('enabled').filterBy('clusterTemplateId', selectedClusterTemplateId);
    clusterTemplate          = clusterTemplates.findBy('id', selectedClusterTemplateId)

    let mapped = clusterTemplateRevisions.map((clusterTemplateRevision) => {
      let d    = moment(clusterTemplateRevision.created);
      const isDefault = !isEmpty(clusterTemplate) ? clusterTemplate.defaultRevisionId === clusterTemplateRevision.id : false;

      let out = {
        id:   clusterTemplateRevision.id,
        name: intl.t(`clusterNew.rke.clustersSelectTemplateRevision.select.${ isDefault ? 'default' : 'other' }`, {
          name: clusterTemplateRevision.name,
          ago:  d.fromNow()
        }),
      };

      // editing a cluster not a template
      if (this.isEdit && this.cluster.type === 'cluster') {
        const originalKubeVersion = coerceVersion(get(originalCluster, 'rancherKubernetesEngineConfig.kubernetesVersion'));
        const rawRevisionKubeVersion = clusterTemplateRevision.clusterConfig.rancherKubernetesEngineConfig.kubernetesVersion;
        const revisionKubeVersion = coerceVersion(rawRevisionKubeVersion);
        const validRange = rawRevisionKubeVersion.endsWith('.x') && Semver.validRange(`<=${ rawRevisionKubeVersion }`);
        // Filter revisions with kube versions that are downgrades from the original kube version. We're using satisfies here so
        // that we can support semvers with a .x suffix. When the revision kube version is coerced and ends in .x (which signifies latest patch)
        // it gets coerced into .0 which makes the simple lt check erroenously think the revision version is less than the original version. We
        // still use lt just incase the rawRevisionKubeVersion isn't a valid range and needs to be coereced.
        const isRevisionKubeVersionCompatible =  validRange
          ? Semver.satisfies(originalKubeVersion, validRange)
          : Semver.lte(originalKubeVersion, revisionKubeVersion)

        if (!isRevisionKubeVersionCompatible) {
          set(out, 'disabled', true);
        }
      }

      return out;
    })

    if (clusterTemplate && clusterTemplateRevisionId === null ) {
      once(this, this.setDefaultRevisionId, clusterTemplate);
    }

    return mapped.sortBy('created').reverse();
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

  canEditForm: computed('clusterOptErrors.[]', function() {
    return (this.clusterOptErrors || []).length === 0;
  }),

  psaOpts: computed('model.psacs.[]', function(){
    let psacs = get(this, 'model.psacs').toArray()
    const intl     = get(this, 'intl');

    return [
      { displayName: intl.t('generic.none'), },
      ...psacs]
  }),


  supportsPSA: computed('config.kubernetesVersion', function() {
    // rke config supports PSA if version >= 1.23.0 - this is also when PSP support ends
    const selectedVersion = coerceVersion(get(this, 'config.kubernetesVersion'))

    return selectedVersion ? satisfies(selectedVersion, '>=1.23.0') : true
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

  versionChoices: computed(`settings.${ C.SETTING.VERSIONS_K8S }`, 'clusterTemplateCreate', function() {
    let out = JSON.parse(get(this, `settings.${ C.SETTING.VERSIONS_K8S }`) || '{}');

    out = Object.keys(out);

    let patchedOut = [];

    if (this.clusterTemplateCreate) {
      patchedOut = out.map((version) => {
        return `${ major(version) }.${ minor(version) }.x`;
      });
    }

    return [...out, ...patchedOut];
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

  yamlValue: computed('isEdit', 'pasteOrUpload', 'primaryResource', {
    get() {
      // On edit we should get the cluster fields that are updateable, any fields added during the creation would need the cluster fields at the time
      const intl     = get(this, 'intl');
      let config     = this.isEdit ? this.getSupportedFields(get(this, 'primaryResource'), 'cluster', EXCLUED_CLUSTER_OPTIONS) : this.getClusterFields(this.primaryResource);
      let cpConfig = get(config, 'rancher_kubernetes_engine_config.cloud_provider');

      config = removeEmpty(config, EXCLUDED_KEYS, EXCLUDED_CHILDREN_KEYS);
      // get rid of undefined
      config = JSON.parse(JSON.stringify(config));


      if ( cpConfig ) {
        cpConfig = removeEmpty(cpConfig, EXCLUDED_KEYS, EXCLUDED_CHILDREN_KEYS);
        if (cpConfig.name === 'aws' && !cpConfig.awsCloudProvider) {
          config.rancher_kubernetes_engine_config.cloud_provider = {
            ...config.rancher_kubernetes_engine_config.cloud_provider,
            type:             'cloudProvider',
            awsCloudProvider: { type: 'awsCloudProvider' },
          };
        } else if (cpConfig.azureCloudProvider) {
          // this is a quick and dirty fix for azure only because it is currently the only cp that works
          // this whole process will be recieving updates shortly so this is a temp fix
          // client_id, secret, & subscription_id are all required so ensure they are there on NEW when a user has entered them but switched to yaml or edit
          // removeEmpty works great except for these fields and adding nested paths doesn't work in removeEmpty
          Object.assign(config.rancher_kubernetes_engine_config.cloud_provider.azureCloudProvider, {
            'aad_client_cert_password': cpConfig.azureCloudProvider.aad_client_cert_password || '',
            'aad_client_id':            cpConfig.azureCloudProvider.aad_client_id || '',
            'aad_client_secret':        cpConfig.azureCloudProvider.aad_client_secret || '',
            'tenant_id':                cpConfig.azureCloudProvider.tenant_id || '',
            'subscription_id':          cpConfig.azureCloudProvider.subscription_id || '',
          });
        }
      }

      // Remove any empty 'value_from' keys from agent env vars
      (config.agent_env_vars || []).forEach((envVar) => {
        if (envVar.value_from && Object.getOwnPropertyNames(envVar.value_from).length === 0) {
          delete envVar.value_from;
        }
      });

      let yaml  = jsyaml.safeDump(config, { sortKeys: true });
      let lines = yaml.split('\n');
      let out   = '';

      lines.forEach((line, idx) => {
        if ( line.trim() ) {
          if (!this.isEdit) {
            let key          = '';
            let commentLines = '';

            if (idx === 0) {
              commentLines = intl.t('').split('\n');
              key = `rkeConfigComment.clusterConfig`
            } else {
              key = `rkeConfigComment.${ line.split(':')[0].trim() }`
            }

            if ( intl.exists(key) ) {
              commentLines = intl.t(key).split('\n');

              commentLines.forEach((commentLine) => {
                out += `# ${ commentLine.slice(1, commentLine.length - 1) }\n`;
              });
            }
          }
          out += `${ line.trimEnd() }\n`;
        }
      });

      return out;
    },

    set(key, value) {
      next(() => {
        set(this, 'clusterOptErrors', this.checkYamlForRkeConfig(value));
      });

      return value;
    }
  }),

  allErrors: computed('errors.[]', 'clusterErrors.[]', 'otherErrors.[]', 'clusterOptErrors.[]', function() {
    let {
      errors, clusterErrors, clusterOptErrors, otherErrors,
    } = this;

    return [...(errors || []), ...(clusterErrors || []), ...(clusterOptErrors || []), ...(otherErrors || [])];
  }),


  cisProfileDisplay: computed('cisProfile', 'cisScanProfileOptions', function() {
    const profile = get(this, 'cisScanProfileOptions').find((option) => option.value === get(this, 'cisProfile'));

    return profile ? profile.label : '';
  }),

  cisScanProfileOptions: computed('cisProfile', 'cisHelpers.cisScanProfileOptions', function() {
    const selectedProfile = get(this, 'cisProfile')
    const options = get(this, 'cisHelpers.cisScanProfileOptions');
    const foundProfile = options.find((option) => option.value === selectedProfile);

    if (!foundProfile && selectedProfile) {
      const splitProfile = selectedProfile.split(' ');

      splitProfile[1] = ucFirst(splitProfile[1]);
      const missingOption = {
        label: splitProfile.join(' '),
        value: splitProfile
      }

      return [missingOption, ...options];
    }

    return options;
  }),

  provider: computed('model.cluster.clusterProvider', 'model.provider', function() {
    return get(this, 'model.provider') ? get(this, 'model.provider') : get(this, 'model.cluster.clusterProvider');
  }),

  initScheduledClusterScan() {
    // We need to wait for benchmarks to be available before we can actually create the profiles
    if (this.cisHelpers.cisScanBenchmarks.length === 0) {
      return;
    }

    const kubernetesVersion = get(this, 'primaryResource.rancherKubernetesEngineConfig.kubernetesVersion');
    const defaultProfileOption = this.cisHelpers.getDefaultCisScanProfileOption(kubernetesVersion);
    const scheduledClusterScan = get(this, 'primaryResource.scheduledClusterScan') || get(this, 'scheduledClusterScan');
    const scanConfig = get(this, 'primaryResource.scheduledClusterScan.scanConfig') || this.cisHelpers.profileToClusterScanConfig(defaultProfileOption);
    const scheduleConfig = get(this, 'primaryResource.scheduledClusterScan.scheduleConfig') ||  get(this, 'scheduledClusterScan.scheduleConfig');
    const cisProfile =  this.cisHelpers.clusterScanConfigToProfile(scanConfig);
    const enabled = get(this, 'primaryResource.scheduledClusterScan.enabled');

    set(this, 'scheduledClusterScan', scheduledClusterScan);
    set(this, 'scheduledClusterScan.enabled', typeof enabled === 'string' ? enabled === 'true' : !!enabled);
    set(this, 'scheduledClusterScan.scanConfig', scanConfig);
    set(this, 'scheduledClusterScan.scheduleConfig', scheduleConfig);
    set(this, 'cisProfile', cisProfile);
  },

  getDefaultUpgradeStrategy() {
    return this.globalStore.createRecord({
      type:           'nodeUpgradeStrategy',
      nodeDrainInput: this.globalStore.createRecord({ type: 'nodeDrainInput' })
    });
  },

  initUpgradeStrategy() {
    const upgradeStrategy = get(this, 'primaryResource.rancherKubernetesEngineConfig.upgradeStrategy');
    const defaultUpgradeStrategy = this.getDefaultUpgradeStrategy();
    const source = upgradeStrategy
      ? upgradeStrategy
      : defaultUpgradeStrategy;

    const maxUnavailableControlplane = get(source, 'maxUnavailableControlplane');
    const maxUnavailableWorker = get(source, 'maxUnavailableWorker') || '';
    const maxUnavailableUnit = maxUnavailableWorker.includes('%') ? 'percentage' : 'count';
    const drainInput = get(source, 'nodeDrainInput');
    const timeout = get(source, 'nodeDrainInput.timeout');
    const drainStatusStr = (get(source, 'drain') || false).toString();

    set(this, 'upgradeStrategy.maxUnavailableControlplane', maxUnavailableControlplane);
    set(this, 'upgradeStrategy.maxUnavailableWorker', maxUnavailableWorker.replace('%', ''));
    set(this, 'upgradeStrategy.maxUnavailableUnit', maxUnavailableUnit);
    set(this, 'upgradeStrategy.nodeDrainInput', drainInput ? drainInput : {});
    set(this, 'upgradeStrategy.drain', drainStatusStr);

    // This ensures the UI won't initialize the timeout below the minimum.
    if (timeout !== undefined && timeout <= 0) {
      const defaultTimeout = get(defaultUpgradeStrategy, 'nodeDrainInput.timeout');

      set(this, 'upgradeStrategy.nodeDrainInput.timeout', defaultTimeout);
    }
  },

  getClusterFields(primaryResource) {
    let pojoPr = JSON.parse(JSON.stringify(removeEmpty(primaryResource, EXCLUDED_KEYS, EXCLUDED_CHILDREN_KEYS)));
    let decamelizedObj = {};

    decamelizedObj = keysToDecamelize(pojoPr, void (0), ['type', 'azureCloudProvider']);

    return decamelizedObj;
  },

  checkYamlForRkeConfig(yamlValue) {
    let decamledYaml = this.parseOptsFromYaml(yamlValue);
    let errOut = null;

    if (decamledYaml && isEmpty(decamledYaml.rancherKubernetesEngineConfig)) {
      errOut = [`Cluster Options Parse Error: Missing Rancher Kubernetes Engine Config`];
    }

    return errOut;
  },

  pastedYaml(cm) {
    next(() => {
      set(this, 'clusterOptErrors', this.checkYamlForRkeConfig(cm.doc.getValue()));
    });
  },

  parseOptsFromYaml(yamlValue) {
    let yamlConfig;

    try {
      yamlConfig = jsyaml.safeLoad(yamlValue);
    } catch ( err ) {
      set(this, 'clusterOptErrors', [`Cluster Options Parse Error: ${ err.snippet } - ${ err.message }`]);

      return;
    }

    return keysToCamel(yamlConfig);
  },

  getOptsFromYaml() {
    let { yamlValue } = this;
    let decamledYaml = this.parseOptsFromYaml(yamlValue);

    if (!decamledYaml){
      return;
    }

    if (decamledYaml && isEmpty(decamledYaml.rancherKubernetesEngineConfig)) {
      set(this, 'clusterOptErrors', [`Cluster Options Parse Error: Missing rancher_kubernetes_engine_config key`]);

      return;
    }

    decamledYaml.type = this.primaryResource.type;

    return this.globalStore.createRecord(decamledYaml);
  },

  buildClusterAnswersFromConfig(cluster, questions) {
    let { backupStrategy } = this;
    let answers            = {};

    if (questions && questions.length) {
      questions.forEach((quest) => {
        // ember.object.get doesn't support bracket notation, this provides support for the notation by replace some[0].object with some.0.object
        // which ember does support. I'm putting this here instead of replacing the answer variables because I think it's more intuitive to specify
        // variables with the bracket notation.
        const varaible = quest.variable.replaceAll('[', '.').replaceAll(']', '');
        let match = get(cluster, varaible);

        if (match) {
          answers[quest.variable] = match;
        } else {
          if (quest.variable.includes('s3BackupConfig') && backupStrategy === 'local') {
            // we get into this case when a RKE Template creator lets the user override the backup strategy, and they've changed it to local.
            // if we dont send the answers with nulls the s3backupconfig will be created on the backend from its existence on the RKE Template revision
            answers[quest.variable] = null;
          }
        }
      });
    }

    return answers;
  },

  willSave() {
    const {
      applyClusterTemplate,
      cluster,
      configField: field,
    } = this;
    let ok            = true;

    this.checkKubernetesVersionSemVer();

    if (get(this, 'upgradeStrategy.maxUnavailableUnit') === 'percentage') {
      set(this, 'upgradeStrategy.maxUnavailableWorker', (`${ get(this, 'upgradeStrategy.maxUnavailableWorker')  }%`));
    }

    if (!get(this, 'upgradeStrategy.drain')) {
      set(this, 'upgradeStrategy.nodeDrainInput', null);
    }
    set(cluster, 'rancherKubernetesEngineConfig.upgradeStrategy', get(this, 'upgradeStrategy'));

    if (get(this, 'scheduledClusterScan.enabled')) {
      try {
        set(this, 'scheduledClusterScan.scanConfig', this.cisHelpers.profileToClusterScanConfig(get(this, 'cisProfile')));
      } catch (ex) {
        set(this, 'scheduledClusterScan.scanConfig', null);
        console.error('There was a problem attempting to map a profile to a clusterScanConfig', ex, get(this, 'cisProfile'));
      }
    } else {
      set(this, 'scheduledClusterScan.scanConfig', null);
      set(this, 'scheduledClusterScan.scheduleConfig', null);
    }
    set(cluster, 'scheduledClusterScan', get(this, 'scheduledClusterScan'));

    set(this, 'isWindowsPreferedCluster', cluster?.windowsPreferedCluster);

    if (this.pasteOrUpload && this.mode !== 'view') {
      const newOpts = this.getOptsFromYaml();

      if (newOpts) {
        if (this.updateFromYaml) {
          this.updateFromYaml(newOpts);
        }
      } else {
        return false;
      }
    }

    if (get(cluster, 'localClusterAuthEndpoint')) {
      if (!get(cluster, 'rancherKubernetesEngineConfig') || isEmpty(get(cluster, 'rancherKubernetesEngineConfig'))) {
        delete cluster.localClusterAuthEndpoint;
      }
    }

    set(this, 'errors', null);

    // Fix up agent env vars - remove any with empty 'valueFrom' properties
    const agentEnvVars = get(this, 'cluster.agentEnvVars') || [];
    let didChangeEnvVars = false;

    agentEnvVars.forEach((envVar) => {
      if (envVar.valueFrom && Object.getOwnPropertyNames(envVar.valueFrom).length === 0) {
        delete envVar.valueFrom;
        didChangeEnvVars = true;
      }
    });

    if (didChangeEnvVars) {
      set(this, 'cluster.agentEnvVars', agentEnvVars);
    }

    ok = this.validate();

    if (ok) {
      if (typeOf(cluster.clearProvidersExcept) === 'function' || applyClusterTemplate && typeOf(this.buildClusterAnswersFromConfig) === 'function') {
        if (applyClusterTemplate) {
          let questions = get(this, 'model.clusterTemplateRevision.questions') || [];
          let answers   = [];
          let errors    = null;

          answers    = this.buildClusterAnswersFromConfig(cluster, questions);

          if (questions.length > 0) {
            errors = this.checkRequiredQuestionsHaveAnswers(questions, answers);
          }

          // When creating from an RKE Cluster Template with weave networking, add provider password
          const networkType = get(cluster, C.NETWORK_QUESTIONS.PLUGIN);

          if (networkType === WEAVE) {
            const provider = get(cluster, C.NETWORK_QUESTIONS.WEAVE_NETWORK_PROVIDER);

            if (provider) {
              answers[C.NETWORK_QUESTIONS.WEAVE_PASSWORD] = randomStr(16, 16, 'password');
            }
          }

          if (isEmpty(errors)) {
            set(cluster, 'answers', { values: answers });

            this.cluster.clearConfigFieldsForClusterTemplate();
          } else {
            set(this, 'errors', errors);

            ok = false;
          }
        } else {
          cluster.clearProvidersExcept(field);
        }
      }
    } else {
      // If validation fails, we stay on the form, so we need to undo the formatting of the max unavailable worker
      // otherwise we keep adding a '%' to the input field
      const maxUnavailableWorker = get(this, 'upgradeStrategy.maxUnavailableWorker');

      set(this, 'upgradeStrategy.maxUnavailableWorker', maxUnavailableWorker.replace('%', ''));
    }

    return ok;
  },

  checkRequiredQuestionsHaveAnswers(questions, answers) {
    const { intl } = this;
    const required = questions.filterBy('required', true);
    const errors   = [];

    if (questions.length > 0 && required.length > 0) {
      required.forEach((rq) => {
        if (!answers[rq.variable]) {
          errors.push(intl.t('validation.required', { key: rq.variable }));
        }
      })
    }

    return errors;
  },

  validate() {
    let { config, intl } = this;

    this._super(...arguments);

    let errors = this.errors || [];

    if (this.clusterTemplateCreate) {
      const revision = this.model.clusterTemplateRevision;

      if ( revision ) {
        errors.pushObjects(revision.validationErrors());

        const cloudProvider = get(revision, 'clusterConfig.rancherKubernetesEngineConfig.cloudProvider.name');
        const azureProvider = get(revision, 'clusterConfig.rancherKubernetesEngineConfig.cloudProvider.azureCloudProvider') || {};

        if ( cloudProvider === 'azure' ) {
          const azureQuestions = (get(revision, 'questions') || []).map((x) => x.variable.replace(/^rancherKubernetesEngineConfig\.cloudProvider\.azureCloudProvider\./, ''));
          const requiredFields = Object.keys(AzureInfo).filter((k) => AzureInfo[k].required);

          requiredFields.forEach((key) => {
            if ( !get(azureProvider, key) && !azureQuestions.includes(key)) {
              errors.push(intl.t('validation.requiredOrOverride', { key }));
            }
          });
        }
      }
    } else {
      if ( !get(this, 'isCustom') ) {
        errors.pushObjects(get(this, 'nodePoolErrors'));
      }

      if ( get(config, 'cloudProvider.name') === 'azure' && !this.applyClusterTemplate ) {
        Object.keys(AzureInfo).forEach((key) => {
          if ( get(AzureInfo, `${ key }.required`) && !get(config, `cloudProvider.azureCloudProvider.${ key }`)) {
            if ( this.isNew || this.isEdit && key !== 'aadClientSecret' ) {
              errors.push(intl.t('validation.required', { key }));
            }
          }
        });
      }
    }

    if (get(this, 'config.services.etcd.snapshot')) {
      errors = this.validateEtcdService(errors);
    }

    if ( get(this, 'primaryResource.localClusterAuthEndpoint.enabled') ) {
      errors = this.validateAuthorizedClusterEndpoint(errors);
    }

    set(this, 'errors', errors);

    return get(this, 'errors.length') === 0;
  },

  validateAuthorizedClusterEndpoint(errors) {
    let { localClusterAuthEndpoint } = get(this, 'primaryResource');
    let { caCerts, fqdn } = localClusterAuthEndpoint;

    if (caCerts) {
      if (!validateCertWeakly(caCerts) ) {
        errors.push(this.intl.t('newCertificate.errors.cert.invalidFormat'));
      }
    }

    // FQDN here can include port number
    if (fqdn) {
      const fqdnParts = fqdn.split(':');

      if (fqdnParts.length > 2) {
        errors.push(this.intl.t('authorizedEndpoint.fqdn.invalid'));
      }

      errors = validateHostname(fqdnParts[0], 'FQDN', get(this, 'intl'), { restricted: true }, errors);

      if (fqdnParts.length === 2) {
        const port = parseInt(fqdnParts[1], 10);

        if (isNaN(port) || port < 1 || port > 65535) {
          errors.push(this.intl.t('authorizedEndpoint.fqdn.invalid'));
        }
      }
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
      this.loadToken();
    } else {
      if (close) {
        close(neu);
      }
    }

    return resolve();
  },

  doneSaveFailed() {
    // Ensure we remove the % from the max unavailable worker field, otherwise they keep getting added
    // if the save fails due to a form issue
    const maxUnavailableWorker = get(this, 'upgradeStrategy.maxUnavailableWorker');

    set(this, 'upgradeStrategy.maxUnavailableWorker', maxUnavailableWorker.replace('%', ''));

    return resolve();
  },

  loadToken() {
    const cluster = get(this, 'primaryResource');

    if (cluster.getOrCreateToken) {
      set(this, 'loading', true);

      return cluster.getOrCreateToken().then((token) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        setProperties(this, {
          token,
          step:    2,
          loading: false
        });
      }).catch((err) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        get(this, 'growl').fromError('Error getting command', err);

        set(this, 'loading', false);
      });
    } else {
      return;
    }
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

    if (type === 'map[json]' && get(( field || {} ), 'Resources') && get(( field || {} ), 'kind') === 'EncryptionConfiguration') {
      // this is a one off change to handle rancherKubernetesEngineConfig.services.kubeAPI.secretsEncryptionConfig.customConfig arbitrary JSON problem seeing in #30555.
      return field;
    }

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

  getSupportedFields(source, targetField, excludeFields = []) {
    const out = {};
    const resourceFields = this.getResourceFields(targetField);

    Object.keys(resourceFields).filter((key) => resourceFields[key].update && excludeFields.indexOf(key) === -1).forEach((key) => {
      const field = get(source, key);
      const type = resourceFields[key].type;
      const value = this.getFieldValue(field, type);

      out[camelToUnderline(key)] = value;
    });

    return out;
  },

  initNonTemplateCluster() {
    if ( get(this, 'isNew') ) {
      this.createRkeConfigWithDefaults();
    } else {
      this.initPrivateRegistries();
    }

    this.initBackupConfigs();

    scheduleOnce('afterRender', this, this.initRootDockerDirectory);
  },

  initTemplateCluster() {
    this.initBackupConfigs();

    this.initClusterTemplateQuestions();
  },

  initNodeCounts() {
    const counts = {};
    let initialVersion = get(this, 'config.kubernetesVersion');

    set(this, 'existingNodes', this.globalStore.all('node'));

    this.globalStore.findAll('node').then((all) => {
      all.forEach((node) => {
        const id = get(node, 'clusterId');

        counts[id] = (counts[id] || 0) + 1;
      });

      this.notifyPropertyChange('initialNodeCounts');
    });

    if (this.isEdit && !isEmpty(get(this, 'cluster.appliedSpec.rancherKubernetesEngineConfig.kubernetesVersion'))) {
      initialVersion = this.cluster.appliedSpec.rancherKubernetesEngineConfig.kubernetesVersion;
    }

    setProperties(this, {
      initialVersion,
      initialNodeCounts: counts,
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

    const kubeApiDefaults =  {
      type:                              'kubeAPIService',
      serviceNodePortRange:              '30000-32767',
      secretsEncryptionConfig:           globalStore.createRecord({ type: 'secretsEncryptionConfig' }),
    }

    const rkeConfig = globalStore.createRecord({
      type:                'rancherKubernetesEngineConfig',
      ignoreDockerVersion: true,
      kubernetesVersion:   satisfying,
      authentication:      globalStore.createRecord({
        type:     'authnConfig',
        strategy: 'x509',
      }),
      dns: globalStore.createRecord({
        type:      'dnsConfig',
        nodelocal: globalStore.createRecord({
          type:            'nodelocal',
          ip_address:      '',
          node_selector:   null,
          update_strategy: {},
        })
      }),
      network: globalStore.createRecord({
        type:    'networkConfig',
        plugin:  'canal',
        options: { flannel_backend_type: DEFAULT_BACKEND_TYPE, },
      }),
      ingress: globalStore.createRecord({
        type:           'ingressConfig',
        provider:       'nginx',
        defaultBackend: false,
      }),
      monitoring: globalStore.createRecord({
        type:     'monitoringConfig',
        provider: 'metrics-server',
      }),
      services: globalStore.createRecord({
        type:    'rkeConfigServices',
        kubeApi: globalStore.createRecord(kubeApiDefaults),
        etcd:    globalStore.createRecord({
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
      upgradeStrategy: this.getDefaultUpgradeStrategy()
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

    scheduleOnce('afterRender', this, this.notifyConfigUpdate, out);
  },

  notifyConfigUpdate(out) {
    setProperties(this.primaryResource, out);

    this.notifyPropertyChange('config');
    console.log('config updated');
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
        set(this, 'backupStrategy', 'local');
        this.migrateLegacyEtcdSnapshotSettings();
      } else if (etcd.backupConfig && etcd.backupConfig.s3BackupConfig) {
        set(this, 'backupStrategy', 's3');
      } else if (!etcd.snapshot && !etcd.backupConfig) {
        const backupConfig = get(this, 'globalStore').createRecord({
          enabled: false,
          type:    'backupConfig',
        });

        set(etcd, 'backupConfig', backupConfig)
      } else {
        set(this, 'backupStrategy', 'local');
      }
    }
  },

  initClusterTemplateQuestions() {
    let { clusterTemplateQuestions } = this;

    // Use the existing cluster config values as defaults for the questions
    // because one or more values could already be overridden.
    let primaryResource = get(this, 'config');

    if (clusterTemplateQuestions && clusterTemplateQuestions.length > 0 && primaryResource) {
      clusterTemplateQuestions.forEach((question) => {
        let path = question.variable;

        if (!question.variable.includes('uiOverride') && question.default) {
          deepSet(primaryResource, path, question.default);
        }

        set(question, 'primaryResource', primaryResource);

        defineProperty(question, 'default', alias(`primaryResource.${ path }`));
      });
    }
  },

  checkKubernetesVersionSemVer() {
    let {
      clusterTemplateCreate = false,
      config : { kubernetesVersion },
      model: { clusterTemplateRevision = {} }
    } = this;
    let questions = [];

    if (clusterTemplateRevision && clusterTemplateRevision.questions) {
      questions = clusterTemplateRevision.questions;
    }

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

  setupComponent() {
    this.initUpgradeStrategy();
    this.initScheduledClusterScan();
  },

  setDefaultRevisionId(clusterTemplate) {
    set(this, 'clusterTemplateRevisionId', clusterTemplate.defaultRevisionId);
  }
});
