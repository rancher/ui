import Certificate from './certificate';
import { reference } from 'ember-api-store/utils/denormalize';

export default Certificate.extend({
  namespace: reference('namespaceId'),
});
