import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';
import { computed } from '@ember/object';

export default Resource.extend({
  globalRole: reference('globalRoleId', 'globalRole'),
  canRemove: false,
});
