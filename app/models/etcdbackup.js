import Resource from 'ember-api-store/models/resource';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Resource.extend({
  scope: service(),

  availableActions: computed(() => {
    return [
      {
        label:     'action.restoreFromEtcdBackup',
        icon:      'icon icon-history',
        action:    'restoreFromEtcdBackup',
        enabled:   true,
      },
    ];
  }),

  actions:      {
    restoreFromEtcdBackup() {
      get(this, 'scope.currentCluster').send('restoreFromEtcdBackup', { selection: this })
    },
  },
});
