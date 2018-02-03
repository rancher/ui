import Controller from '@ember/controller';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  clusterStore:    service(),
  globalStore: service(),
  driver: 'googlegke',

  queryParams: ['driver'],

  initConfigs() {
    let configOwner = get(this, 'model.cluster');
    switch(get(this, 'driver')) {
    case 'googlegke':
      delete configOwner.googleKubernetesEngineConfig
      break;
    case 'amazoneks':
      delete configOwner.amazonKubernetesEngineConfig
      break;
    case 'azureaks':
      delete configOwner.azureKubernetesEngineConfig
      break;
    default:
      break;
    }
  },

  actions: {
    switchDriver(name) {
      set(this, 'errors', []);
      set(this, 'driver', name);
      this.initConfigs();
    },

    cancel() {
      this.send('goToPrevious', 'global-admin.clusters');
    },
  },

  sortedDrivers: computed(function() {
    return [
      {
        name: 'googlegke',
        displayName: 'Google GKE'
      },
      {
        name: 'azureaks',
        displayName: 'Azure AKS'
      },
      {
        name: 'amazoneks',
        displayName: 'Amazon EKS'
      },
    ];
  }),

});
