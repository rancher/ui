import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { set, computed } from '@ember/object';

export default Controller.extend(NewOrEdit, {
  clusterStore:    service(),
  intl: service(),
  driver: 'googlegke',

  primaryResource: alias('model.cluster'),

  actions: {
    switchDriver(name) {
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

  validate() {
    this._super();
    var errors = this.get('errors', errors) || [];
    const name = (this.get('primaryResource.name') || '').trim();
    if (name.length === 0) {
      errors.push(this.get('intl').findTranslationByKey('clustersPage.new.errors.nameReq'));
    }

    if (name.length > 0 && this.get('model.clusters').find(c => c.name === name)) {
      errors.push(get(this, 'intl').findTranslationByKey('clustersPage.new.errors.nameInExists'));
    }

    this.set('errors', errors);
    return this.get('errors.length') === 0;
  },

  doneSaving() {
    this.transitionToRoute('clusters.index');
  },
});
