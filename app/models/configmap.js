import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import { reference } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router:       service(),
  clusterStore: service(),

  namespace: reference('namespaceId', 'namespace', 'clusterStore'),

  state: 'active',

  actions: {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.config-maps.detail.edit', get(this, 'id'));
    },
  },

  canClone: false,

  keys: computed('data', function() {
    return Object.keys(get(this, 'data')||{}).sort();
  }),

  firstKey: alias('keys.firstObject'),
});
