import DockerCredential from './dockercredential';
import { reference } from 'ember-api-store/utils/denormalize';

export default DockerCredential.extend({
  namespace: reference('namespaceId'),
});
