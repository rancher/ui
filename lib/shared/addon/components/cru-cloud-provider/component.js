import Component from '@ember/component';
import layout from './template';
import {
  computed, get, set, setProperties, observer
} from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import C from 'ui/utils/constants';
import { azure as AzureInfo } from './cloud-provider-info';
import { next } from '@ember/runloop';
import { debouncedObserver } from 'ui/utils/debounce';
import Semver from 'semver';

const azureDefaults = C.AZURE_DEFAULTS;
const GENERIC_PATH  = 'cluster.rancherKubernetesEngineConfig.cloudProvider.cloudConfig';
const AWS_PATH      = 'cluster.rancherKubernetesEngineConfig.cloudProvider.awsCloudProvider';
const AZURE_PATH    = 'cluster.rancherKubernetesEngineConfig.cloudProvider.azureCloudProvider';

export default Component.extend({
  globalStore:                 service(),
  settings:                    service(),
  growl:                       service(),
  layout,
  configType:                  null,
  cluster:                     null,
  driver:                      null,
  selectedCloudProvider:       'none',
  mode:                        'new',
  hasBuiltIn:                  false,
  configAnswers:               null,
  clusterTemplateCreate:       false,
  configVariable:              null,
  questions:                   null,
  azureDefaults,
  azureDescriptions:           AzureInfo,
  unsupportedProviderSelected: false,
  showChangedToAmazonExternal: false,
  // track the original configuration to revert the switch to 'external' when the selected provider is not supported
  initialCloudProvider:        null,
  initialConfigAnswers:        null,

  configName: alias('cluster.rancherKubernetesEngineConfig.cloudProvider.name'),

  init() {
    this._super(...arguments);


    const cloudProviderName = get(this, 'cluster.rancherKubernetesEngineConfig.cloudProvider.name');

    if ( cloudProviderName === 'aws' ) {
      setProperties(this, {
        selectedCloudProvider: 'amazonec2',
        configAnswers:         get(this, AWS_PATH),
        initialCloudProvider:  'amazonec2',
        initialConfigAnswers:         get(this, AWS_PATH)
      });
    } else if ( cloudProviderName === 'azure' ) {
      const reorderedAnswers = this.sortAzureFields(this.globalStore.getById('schema', 'azurecloudprovider'), get(this, AZURE_PATH));

      this.setCpFields(`azureCloudProvider`, reorderedAnswers);

      setProperties(this, {
        selectedCloudProvider: 'azure',
        configAnswers:         reorderedAnswers,
        initialCloudProvider:  'azure',
        initialConfigAnswers:  reorderedAnswers
      });
    } else if ( !cloudProviderName ) {
      set(this, 'selectedCloudProvider', 'none');
    } else {
      setProperties(this, {
        selectedCloudProvider: cloudProviderName ?  cloudProviderName : 'generic',
        configAnswers:         get(this, GENERIC_PATH),
        initialCloudProvider:  cloudProviderName ?  cloudProviderName : 'generic',
        initialConfigAnswers:  get(this, GENERIC_PATH)
      });
    }
  },

  driverDidChange: observer('driver', function() {
    set(this, 'selectedCloudProvider', 'none');
  }),

  modeChanged: observer('selectedCloudProvider', function() {
    let selectedCloudProvider = get(this, 'selectedCloudProvider');

    if ( selectedCloudProvider !== 'none' ) {
      this.constructConfig();
    } else {
      let config = get(this, 'cluster.rancherKubernetesEngineConfig');

      if (config && get(config, 'cloudProvider')) {
        delete config.cloudProvider;
      }
    }
  }),

  harvesterCloudProviderDisabledChange: observer('harvesterCloudProviderDisabled', function() {
    if (get(this, 'harvesterCloudProviderDisabled')) {
      set(this, 'selectedCloudProvider', 'none')
    }
  }),

  k8sVersionDidChange: observer( 'cluster.rancherKubernetesEngineConfig.kubernetesVersion', function(){
    const kubernetesVersion = get(this, 'cluster.rancherKubernetesEngineConfig.kubernetesVersion')
    const selectedCloudProvider = get(this, 'selectedCloudProvider')

    if (selectedCloudProvider === 'amazonec2' && Semver.gte(Semver.coerce(kubernetesVersion), '1.27.0')){
      set(this, 'unsupportedProviderSelected', true);
      set(this, 'selectedCloudProvider', 'external-aws');
      set(this, 'showChangedToAmazonExternal', true);
      this.constructConfig()
    } else if (get(this, 'unsupportedProviderSelected')){
      setProperties(this, {
        unsupportedProviderSelected: false,
        selectedCloudProvider:       get(this, 'initialCloudProvider'),
        configAnswers:               get(this, 'initialConfigAnswers')
      })
    }
  }),

  configAnswersDidChange: debouncedObserver('mappedConfigAnswers.@each.{key,value}', function() {
    const mappedAnswers = get(this, 'mappedConfigAnswers');
    const selectedCloudProvider = get(this, 'selectedCloudProvider');
    const configAnswersOut = {};
    let pathForSet;

    switch (selectedCloudProvider) {
    case 'azure':
      pathForSet = AZURE_PATH;

      break;

    case 'amazonec2':
      pathForSet = AWS_PATH;

      break;

    default:
      pathForSet = GENERIC_PATH;

      break;
    }

    mappedAnswers.forEach((answer) => {
      set(configAnswersOut, answer.key, answer.value);
    });

    set(this, pathForSet, configAnswersOut);
  }),

  selectedCloudProviderOverrideAvailable: computed(
    'applyClusterTemplate', 'clusterTemplateCreate', 'clusterTemplateRevision.{id,questions}', 'configName', 'selectedCloudProvider', 'isDestroying', 'isDestroyed',
    function() {
      let { clusterTemplateRevision, applyClusterTemplate } = this;


      if (applyClusterTemplate && clusterTemplateRevision) {
        if (clusterTemplateRevision.questions) {
          let found = clusterTemplateRevision.questions.filter((ctr) => {
            return ctr.variable.includes('rancherKubernetesEngineConfig.cloudProvider');
          });

          if (found.length === 0 && this.selectedCloudProvider !== 'none') {
            set(this, 'selectedCloudProvider', 'none');
          }

          return found.length >= 1;
        } else {
          if (this.configName) {
            next(() => {
              if (this.isDestroyed || this.isDestroying) {
                return;
              }
              set(this, 'selectedCloudProvider', this.configName);
            });
          }
        }
      }

      return false;
    }),

  isCreateClusterOrClusterTemplate: computed('applyClusterTemplate', function() {
    const { applyClusterTemplate } = this;

    if (applyClusterTemplate) {
      return false;
    } else {
      return true;
    }
  }),

  mappedConfigAnswers: computed('configAnswers', function() {
    const configAnswers = (get(this, 'configAnswers') || {});
    const out = [];

    Object.keys(configAnswers).forEach((answerKey) => {
      out.push({
        key:   answerKey,
        value: configAnswers[answerKey]
      });
    });

    return out;
  }),

  showVsphereHelperText: computed('selectedCloudProvider', 'driver', function() {
    const driver = get(this, 'driver');
    const selectedCloudProvider = get(this, 'selectedCloudProvider');

    return (driver === 'custom' || driver === 'vmwarevsphere') &&
           (selectedCloudProvider === 'external')
  }),

  harvesterCloudProviderDisabled: computed('cluster.name', 'model.{harvesterNodeTemplateId,nodeTemplates}', function() {
    const nodeTemplate = (get(this, 'model.nodeTemplates') || []).find((n) => n.id === get(this, 'model.harvesterNodeTemplateId')) || {}
    const cloudCredentialId = get(nodeTemplate, 'cloudCredentialId')
    const cloudCredential = get(this, 'globalStore').getById('cloudCredential', cloudCredentialId) || {}
    const isExternalCredential = get(cloudCredential, 'harvestercredentialConfig.clusterType') === 'external'

    return !get(this, 'model.harvesterNodeTemplateId') || !get(this, 'cluster.name') || isExternalCredential
  }),

  awsSupported: computed('cluster.rancherKubernetesEngineConfig.kubernetesVersion', function(){
    const kubernetesVersion = get(this, 'cluster.rancherKubernetesEngineConfig.kubernetesVersion')

    return Semver.lt(Semver.coerce(kubernetesVersion), '1.27.0')
  }),

  canEditProvider: computed('applyClusterTemplate', 'unsupportedProviderSelected', function(){
    return (!!get(this, 'applyClusterTemplate') || get(this, 'unsupportedProviderSelected'))
  }),

  checkDefaults(record) {
    get(this, 'azureDefaults').forEach((def) => {
      if (isEmpty(record[def])) {
        set(record, def, null);
      }
    });
  },

  sortAzureFields(schema, answers) {
    const schemaFields      = schema.getFieldNames();
    const resourceFields    = get(schema, 'resourceFields');
    const descriptionInfo   = AzureInfo;
    const requiredFields    = schemaFields.filter((item) => get(descriptionInfo, `${ item }.required`)).sort();
    const keysWithoutFields = schemaFields.filter((item) => !requiredFields.includes(item)).sort();
    const prioritizedKeys   = keysWithoutFields.unshiftObjects(requiredFields);
    const reorderedFields   = {};

    // Hack the schema to be required so validation will require them
    requiredFields.forEach((key) => {
      schema.resourceFields[key].required = true;
    });

    prioritizedKeys.forEach((key) => {
      let resourceField = get(resourceFields, key);

      if (answers && answers.hasOwnProperty(key)) {
        set(reorderedFields, key, get(answers, key));
      } else {
        if (get(resourceField, 'type') === 'password') {
          set(reorderedFields, key, null);
        }
      }
    });

    return reorderedFields;
  },

  constructConfig() {
    let nue                   = {};
    let selectedCloudProvider = get(this, 'selectedCloudProvider');
    let cluster               = get(this, 'cluster');
    let config                = get(cluster, 'rancherKubernetesEngineConfig') || set(cluster, 'rancherKubernetesEngineConfig', {});
    let harvesterCluster      = {}
    let nodeTemplate

    switch (selectedCloudProvider) {
    case 'azure':

      nue = get(this, 'globalStore').createRecord({ type: 'azureCloudProvider' });

      delete nue.type;

      this.checkDefaults(nue);

      nue = this.sortAzureFields(this.globalStore.getById('schema', 'azurecloudprovider'), nue);

      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type:               'cloudProvider',
        name:               'azure',
        azureCloudProvider: nue
      }));

      setProperties(this, {
        hasBuiltIn:                              true,
        'cluster.rancherKubernetesEngineConfig': config,
        configAnswers:                           nue,
      });

      break;

    case 'amazonec2':

      nue = get(this, 'globalStore').createRecord({ type: 'awsCloudProvider' });

      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type:             'cloudProvider',
        name:             'aws',
        awsCloudProvider: nue
      }));

      set(this, 'configAnswers', nue);

      break;

    case 'harvester':
      harvesterCluster = this.getHarvesterCluster()

      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type:                   'cloudProvider',
        name:                   'harvester',
        harvesterCloudProvider: nue,
      }));

      set(this, 'configAnswers', nue);

      nodeTemplate = (get(this, 'model.nodeTemplates') || []).find((n) => n.id === get(this, 'model.harvesterNodeTemplateId'))

      get(this, 'globalStore').rawRequest({
        url:    `/k8s/clusters/${ harvesterCluster.id }/v1/harvester/kubeconfig`,
        method: 'POST',
        data:   {
          csiClusterRoleName: 'harvesterhci.io:csi-driver',
          clusterRoleName:    'harvesterhci.io:cloudprovider',
          namespace:          get(nodeTemplate, 'harvesterConfig.vmNamespace'),
          serviceAccountName: get(cluster, 'name'),
        },
      }).then((obj) => {
        set(config, 'cloudProvider.harvesterCloudProvider.cloudConfig', get(obj, 'body'))
      })
        .catch((err) => {
          get(this, 'growl').fromError('Error getting kubeconfig file', err);
        })

      break;

    case 'external-aws':

      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type:                        'cloudProvider',
        name:                        'external-aws',
        useInstanceMetadataHostname: true,
      }));

      break;

    case 'external':

      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type:             'cloudProvider',
        name:             'external',
      }));

      break;

    default:

      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type:        'cloudProvider',
        cloudConfig: nue
      }));

      set(this, 'configAnswers', nue);

      break;
    }
  },

  setCpFields() {
    throw new Error('setCpFields action is required!');
  },

  addOverride() {
    throw new Error('addOverride action is required!');
  },

  cloudProviderUserChange() {
    set(this, 'showChangedToAmazonExternal', false);
  },

  getHarvesterCluster() {
    const nodeTemplate = (get(this, 'model.nodeTemplates') || []).find((n) => n.id === get(this, 'model.harvesterNodeTemplateId'))
    const cloudCredentialId = get(nodeTemplate, 'cloudCredentialId')
    const cloudCredential = get(this, 'globalStore').getById('cloudCredential', cloudCredentialId)
    const clusterId = get(cloudCredential, 'harvestercredentialConfig.clusterId')
    const harvesterCluster = get(this, 'globalStore').getById('cluster', clusterId)

    return harvesterCluster
  },
});
