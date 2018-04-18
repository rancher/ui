import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router: service(),

  state: 'active',

  canClone: false,

  actions: {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.secrets.detail.edit', get(this, 'id'));
    },
  },

  keys: computed('data', function() {
    return Object.keys(get(this, 'data')||{}).sort();
  }),

  firstKey: alias('keys.firstObject'),
});
