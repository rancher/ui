import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  firstKey: alias('keys.firstObject'),
  keys:     computed('data', function() {

    return Object.keys(get(this, 'data') || {}).sort();

  }),

  router: service(),

  state: 'active',

  actions: {
    edit() {

      get(this, 'router').transitionTo('authenticated.project.secrets.detail.edit', get(this, 'id'));

    },
  },

});
