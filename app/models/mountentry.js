import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';
import { denormalizeInstanceId } from 'ui/utils/denormalize-snowflakes';

export default Resource.extend({
  isReadWrite: Ember.computed.equal('permission','rw'),
  isReadOnly:  Ember.computed.equal('permission','ro'),

  instance: denormalizeInstanceId(),
  volume: denormalizeId('volumeId'),
});
