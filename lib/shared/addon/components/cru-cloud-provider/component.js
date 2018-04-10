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

export default Component.extend({
  layout,
  globalStore:      service(),
  configName:       alias('cluster.rancherKubernetesEngineConfig.cloudProvider.name'),
  cloudConfig:      null,
  configType:       null,
  cluster:          null,
  driver:           null,
  useCloudProvider: false,
  hasBuiltIn:       false,
  configAnswers:    null,
  azureDefaults:    azureDefaults,

  modeChanged: on('init', observer('useCloudProvider', function() {
    let useCloudProvider = get(this, 'useCloudProvider');
    if (useCloudProvider) {
      this.constructConfig();
    } else {
      let config = get(this, 'cluster.rancherKubernetesEngineConfig');
      if (get(config, 'cloudConfig')) {
        delete config.cloudConfig;
      }
    }
  })),

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
        configAnswers: alias('cluster.rancherKubernetesEngineConfig.cloudProvider.azureCloudProvider'),
      });

      break;
    case 'amazonec2':
      nue = get(this, 'globalStore').createRecord({type: 'awsCloudProvider'});
      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type: 'cloudProvider',
        awsCloudProvider: nue
      }));
      set(this, 'configAnswers', alias('cluster.rancherKubernetesEngineConfig.cloudProvider.awsCloudProvider'));
      break;
    default:
      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type: 'cloudProvider',
        cloudConfig: nue
      }));
      set(this, 'configAnswers', alias('cluster.rancherKubernetesEngineConfig.cloudProvider.cloudConfig'));
      break;
    }

    return set(this, 'cloudConfig', nue);
  },

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
