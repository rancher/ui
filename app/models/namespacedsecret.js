import Secret from './secret';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Secret.extend({
  clusterStore: service(),
  router:       service(),

  canClone:     true,

  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),

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
