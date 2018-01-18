import Controller from '@ember/controller';
import { set, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  clusterStore:    service(),
  globalStore: service(),
  driver: 'googlegke',


  actions: {
    switchDriver(name) {
      set(this, 'errors', []);
      set(this, 'driver', name);
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
        name: 'amazoneks',
        displayName: 'Amazon EKS'
      },
      {
        name: 'azureaks',
        displayName: 'Azure AKS'
      },
    ];
  }),

});
