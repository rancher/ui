import Component from '@ember/component';
import layout from './template';
import { get, set, setProperties, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { isEmpty } from '@ember/utils';

const azureDefaults = [
  'aadClientCertPassword',
  'aadClientCertPath',
  'aadClientId',
  'aadClientSecret',
  'cloud',
  'cloudProviderBackoff',
  'cloudProviderBackoffDuration',
  'cloudProviderBackoffExponent',
  'cloudProviderBackoffJitter',
  'cloudProviderBackoffRetries',
  'cloudProviderRateLimit',
  'cloudProviderRateLimitBucket',
  'cloudProviderRateLimitQPS',
  'location',
  'maximumLoadBalancerRuleCount',
  'netResourceGroup',
  'primaryAvailabilitySetName',
  'primaryScaleSetName',
  'resourceGroup',
  'routeTableName',
  'securityGroupName',
  'subnetName',
  'subscriptionId',
  'tenantId',
  'useInstanceMetadata',
  'useManagedIdentityExtension',
  'vmType',
  'vnetName',
  'vnetResourceGroup',
];

const GENERIC_PATH = 'cluster.rancherKubernetesEngineConfig.cloudProvider.cloudConfig';
const AWS_PATH = 'cluster.rancherKubernetesEngineConfig.cloudProvider.awsCloudProvider';
const AZURE_PATH = 'cluster.rancherKubernetesEngineConfig.cloudProvider.azureCloudProvider';

export default Component.extend({
  layout,
  globalStore:      service(),
  configName:       alias('cluster.rancherKubernetesEngineConfig.cloudProvider.name'),
  configType:       null,
  cluster:          null,
  driver:           null,
  useCloudProvider: false,
  hasBuiltIn:       false,
  configAnswers:    null,
  azureDefaults:    azureDefaults,

  init() {
    this._super(...arguments);

    if( get(this, 'cluster.rancherKubernetesEngineConfig.cloudProvider.name') ) {
      set(this, 'useCloudProvider', true);
      set(this, 'intialAnswers', get(this, GENERIC_PATH));
    } else if ( get(this, AZURE_PATH) ) {
      set(this, 'useCloudProvider', true);
      set(this, 'configAnswers', get(this, AZURE_PATH));
      set(this, 'driver', 'azure');
    } else if ( get(this, AWS_PATH) ) {
      set(this, 'useCloudProvider', true);
      set(this, 'configAnswers', get(this, AWS_PATH));
      set(this, 'driver', 'amazonec2');
    }
  },

  driverChanged: observer('driver', function() {
    set(this, 'useCloudProvider', false);
  }),

  modeChanged: observer('useCloudProvider', function() {
    let useCloudProvider = get(this, 'useCloudProvider');
    if ( useCloudProvider ) {
      this.constructConfig();
    } else {
      let config = get(this, 'cluster.rancherKubernetesEngineConfig');
      if (get(config, 'cloudProvider')) {
        delete config.cloudProvider;
      }
    }
  }),

  checkDefaults(record) {
    get(this, 'azureDefaults').forEach( def => {
      if (isEmpty(record[def])) {
        set(record, def, null);
      }
    });
  },

  constructConfig() {
    let nue = {};
    let driver = get(this, 'driver');
    let cluster = get(this, 'cluster');
    let config = get(cluster, 'rancherKubernetesEngineConfig');

    switch(driver) {
    case 'azure':
      nue = get(this, 'globalStore').createRecord({type: 'azureCloudProvider'});
      delete nue.type;
      this.checkDefaults(nue);

      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type: 'cloudProvider',
        azureCloudProvider: nue
      }));

      setProperties(this, {
        hasBuiltIn: true,
        "cluster.rancherKubernetesEngineConfig": config,
        configAnswers: nue,
      });

      break;
    case 'amazonec2':
      nue = get(this, 'globalStore').createRecord({type: 'awsCloudProvider'});
      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type: 'cloudProvider',
        awsCloudProvider: nue
      }));
      set(this, 'configAnswers', nue);
      break;
    default:
      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type: 'cloudProvider',
        cloudConfig: nue
      }));
      set(this, 'configAnswers', nue);
      break;
    }
  },

  configAnswersDidChange: observer('configAnswers', function () {
    const configAnswers = get(this, 'configAnswers');
    let driver = get(this, 'driver');
    switch(driver) {
      case 'azure':
        debugger
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

  driverName: computed('driver', function() {
    let name = '';

    switch(get(this, 'driver')) {
    case 'azure':
      name = 'Azure'
      break;
    case 'amazonec2':
      name = 'Amazon';
      break;
    default:
      name = 'Generic';
      break;
    }

    return name;
  }),

});
