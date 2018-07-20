import Certificate from './certificate';
import { reference } from 'ember-api-store/utils/denormalize';
import { inject as service } from '@ember/service';

export default Certificate.extend({
  clusterStore: service(),
  namespace:    reference('namespaceId', 'namespace', 'clusterStore'),
});
