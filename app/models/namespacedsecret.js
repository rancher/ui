import Secret from './secret';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Secret.extend({
  clusterStore: service(),
  router:       service(),

  canClone: true,

  namespace: reference('namespaceId', 'namespace', 'clusterStore'),

  actions: {
    edit() {
      this.router.transitionTo('authenticated.project.secrets.detail.edit', this.id);
    },

    clone() {
      this.router.transitionTo('authenticated.project.secrets.new', {
        queryParams: {
          id:   this.id,
          type: this.type
        }
      });
    }
  }
});
