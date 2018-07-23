import Resource from 'ember-api-store/models/resource';
import { set, get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default Resource.extend({
  globalStore: service(),
  router:      service(),
  scope:       service(),

  type: 'resourceQuotaTemplate',

  availableActions: computed('isDefault', function() {
    const isDefault = get(this, 'isDefault');

    let out = [
      {
        label:   'action.makeDefault',
        icon:    'icon icon-star-fill',
        action:  'makeDefault',
        enabled: !isDefault
      },
      {
        label:   'action.resetDefault',
        icon:    'icon icon-star-line',
        action:  'resetDefault',
        enabled: isDefault
      },
    ];

    return out;
  }),

  actions: {
    makeDefault() {
      const cur = get(this, 'globalStore').all('resourceQuotaTemplate')
        .filterBy('clusterId', get(this, 'scope.currentCluster.id'))
        .filterBy('isDefault', true);
      const promises = [];

      cur.forEach((sc) => {
        promises.push(sc.setDefault(false));
      });

      all(promises).then(() => {
        this.setDefault(true);
      });
    },

    resetDefault() {
      this.setDefault(false)
    },

    edit() {
      get(this, 'router').transitionTo('authenticated.cluster.quotas.detail.edit', get(this, 'id'));
    },
  },

  setDefault(on) {
    set(this, 'isDefault', on);
    this.save();
  },

});
