import DockerCredential from './dockercredential';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export default DockerCredential.extend({
  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),
  clusterStore: service(),
});
