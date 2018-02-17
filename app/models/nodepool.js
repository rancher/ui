import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  type: 'nodePool',
  nodeTemplate: reference('nodeTemplateId'),
});
