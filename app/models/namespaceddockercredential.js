import DockerCredential from './dockercredential';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default DockerCredential.extend({
  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),
  clusterStore: service(),

  canClone: true,

  actions: {
    clone() {

      get(this, 'router').transitionTo('authenticated.project.registries.new', {
        queryParams: {
          id:   get(this, 'id'),
          type: get(this, 'type')
        }
      });

    }
  },
});
