import Secret from './secret';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export default Secret.extend({
  clusterStore: service(),
  namespace: reference('namespaceId', 'namespace', 'clusterStore'),
});
