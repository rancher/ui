import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import { reference } from 'ember-api-store/utils/denormalize';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  namespace: reference('namespaceId', 'namespace', 'clusterStore'),

  firstKey: alias('keys.firstObject'),
  keys:     computed('data', function() {

    return Object.keys(get(this, 'data') || {}).sort();

  }),

  router:       service(),
  clusterStore: service(),

  state:        'active',
  canClone:     true,

  actions: {
    edit() {

      get(this, 'router').transitionTo('authenticated.project.config-maps.detail.edit', get(this, 'id'));

    },

    clone() {

      get(this, 'router').transitionTo('authenticated.project.config-maps.new', get(this, 'projectId'), { queryParams: { id: get(this, 'id') } });

    }

  },

});
