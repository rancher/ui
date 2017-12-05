import Controller from '@ember/controller';
// import { copy } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { computed } from '@ember/object';
import { sort } from '@ember/object/computed';

export default Controller.extend(NewOrEdit, {
  clusterStore:    service(),

  driver: 'googlegke',

  primaryResource: alias('model.cluster'),

  actions: {
    switchDriver(name) {
      this.set('driver', name);
    },

    cancel(prev) {
      this.send('goToPrevious',prev);
    },
  },

  availableDrivers: computed(function() {
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

  sortBy:        ['name'],
  sortedDrivers: sort('availableDrivers','sortBy'),
});
