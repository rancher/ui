import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  isReadWrite: Ember.computed.equal('permission','rw'),
  isReadOnly:  Ember.computed.equal('permission','ro'),

  instance: denormalizeId('instanceId'),
  volume: denormalizeId('volumeId'),
});
