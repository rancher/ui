import Resource from 'ember-api-store/models/resource';
import { denormalizeIdArray } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  type: 'storagePool',

  hosts: denormalizeIdArray('hostIds'),
  volumes: denormalizeIdArray('volumeIds'),
});
