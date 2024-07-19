import DockerCredential from './dockercredential';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default DockerCredential.extend({
  clusterStore: service(),

  canClone: true,

  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),
  actions:   {
    clone() {
      this.router.transitionTo('authenticated.project.registries.new', {
        queryParams: {
          id:   this.id,
          type: this.type
        }
      });
    }
  },
});
