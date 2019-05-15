import Component from '@ember/component';
import layout from './template';
import { get, set, setProperties, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import C from 'ui/utils/constants';
import { azure as AzureInfo } from './cloud-provider-info';

const azureDefaults = C.AZURE_DEFAULTS;
const GENERIC_PATH  = 'cluster.rancherKubernetesEngineConfig.cloudProvider.cloudConfig';
const AWS_PATH      = 'cluster.rancherKubernetesEngineConfig.cloudProvider.awsCloudProvider';
const AZURE_PATH    = 'cluster.rancherKubernetesEngineConfig.cloudProvider.azureCloudProvider';

export default Component.extend({
  globalStore:           service(),
  layout,
  configType:            null,
  cluster:               null,
  driver:                null,
  selectedCloudProvider: 'none',
  mode:                  'new',
  hasBuiltIn:            false,
  configAnswers:         null,
  azureDefaults,
  azureDescriptions:     AzureInfo,

  configName:            alias('cluster.rancherKubernetesEngineConfig.cloudProvider.name'),

  init() {
    this._super(...arguments);


    const cloudProviderName = get(this, 'cluster.rancherKubernetesEngineConfig.cloudProvider.name');

    if ( cloudProviderName === 'aws' ) {
      setProperties(this, {
        selectedCloudProvider: 'amazonec2',
        configAnswers:         get(this, AWS_PATH)
      });
    } else if ( cloudProviderName === 'azure' ) {
      const reorderedAnswers = this.prioritizeCloudConfigFields(this.globalStore.getById('schema', 'azurecloudprovider'), get(this, AZURE_PATH));

      this.setCpFields(`azureCloudProvider`, reorderedAnswers);

      setProperties(this, {
        selectedCloudProvider: 'azure',
        configAnswers:         reorderedAnswers,
      });
    } else if ( !cloudProviderName ) {
      set(this, 'selectedCloudProvider', 'none');
    } else {
      setProperties(this, {
        selectedCloudProvider: 'generic',
        configAnswers:         get(this, GENERIC_PATH)
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

  configAnswersDidChange: observer('configAnswers', function() {
    const configAnswers         = get(this, 'configAnswers');
    const selectedCloudProvider = get(this, 'selectedCloudProvider');

    switch (selectedCloudProvider) {
    case 'azure':

      set(this, AZURE_PATH, configAnswers);

      break;

    case 'amazonec2':

      set(this, AWS_PATH, configAnswers);

      break;

    default:

      set(this, GENERIC_PATH, configAnswers);

      break;
    }
  }),
  checkDefaults(record) {
    get(this, 'azureDefaults').forEach((def) => {
      if (isEmpty(record[def])) {
        set(record, def, null);
      }
    });
  },

  prioritizeCloudConfigFields(schema, answers) {
    const schemaFields      = schema.getFieldNames();
    const resourceFields    = get(schema, 'resourceFields');
    const passwordFields    = schemaFields.filter((item) => get(resourceFields, `${ item }.type`) === 'password').sort();
    const keysWithoutFields = schemaFields.filter((item) => !passwordFields.includes(item)).sort();
    const prioritizedKeys   = keysWithoutFields.unshiftObjects(passwordFields);
    const reorderedFields   = {};

    prioritizedKeys.forEach((item) => {
      let resourceField = get(resourceFields, item);

      if (answers.hasOwnProperty(item)) {
        set(reorderedFields, item, get(answers, item));
      } else {
        if (get(resourceField, 'type') === 'password') {
          set(reorderedFields, item, null);
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

    switch (selectedCloudProvider) {
    case 'azure':

      nue = get(this, 'globalStore').createRecord({ type: 'azureCloudProvider' });

      delete nue.type;

      this.checkDefaults(nue);

      nue = this.prioritizeCloudConfigFields(this.globalStore.getById('schema', 'azurecloudprovider'), nue);

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


});
