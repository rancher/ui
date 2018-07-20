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
      const answers = get(this, AZURE_PATH);

      delete answers.type;

      setProperties(this, {
        selectedCloudProvider: 'azure',
        configAnswers:         answers
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

});
