import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  layout,
  globalStore: service(),
  cloudConfig: null,
  configType: null,
  cluster: null,
  driver: null,
  useCloudProvider: false,
  hasBuiltIn: false,
  init() {
    this._super(...arguments);

    let nue = {};
    let driver = get(this, 'driver');
    let cluster = get(this, 'cluster');
    let config = get(cluster, 'rancherKubernetesEngineConfig');

    switch(driver) {
    case 'azure':
      nue = get(this, 'globalStore').createRecord({type: 'azureCloudProvider'});
      set(config, 'cloudProvider', get(this, 'globalStore').createRecord({
        type: 'cloudProvider',
        azureCloudProvider: nue
      }));
      set(this, 'hasBuiltIn', true);
      set(this, 'configAnswers', alias('cluster.rancherKubernetesEngineConfig.cloudProvider.azureCloudProvider'));
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

    set(this, 'cloudConfig', nue);
  },
  configAnswers: null,
  intialAnswers: computed('cloudConfig', function() {
    let cloudConfig = get(this, 'cloudConfig');
    let answers = {};
    if (get(this, 'driver') === 'azure') {
      answers = cloudConfig;
      delete answers.type;
    }
    return answers;
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
