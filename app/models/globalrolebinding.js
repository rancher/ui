import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';

export default Resource.extend({
  canRemove:  false,
  globalRole: reference('globalRoleId', 'globalRole'),
});
