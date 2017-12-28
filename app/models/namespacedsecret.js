import Secret from './secret';
import { reference } from 'ember-api-store/utils/denormalize';

export default Secret.extend({
  namespace: reference('namespaceId'),
});
