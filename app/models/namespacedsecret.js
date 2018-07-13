import Secret from './secret';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Secret.extend({
  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),

  clusterStore: service(),
  router:       service(),

  canClone:     true,

  actions: {
    edit() {

      get(this, 'router').transitionTo('authenticated.project.secrets.detail.edit', get(this, 'id'));

    },

    clone() {

      get(this, 'router').transitionTo('authenticated.project.secrets.new', {
        queryParams: {
          id:   get(this, 'id'),
          type: get(this, 'type')
        }
      });

    }
  }
});
