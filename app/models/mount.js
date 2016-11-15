import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';
import { denormalizeInstanceId } from 'ui/utils/denormalize-snowflakes';

var Mount = Resource.extend({
  isReadWrite: Ember.computed.equal('permissions','rw'),
  isReadOnly:  Ember.computed.equal('permissions','ro'),

  instance: denormalizeInstanceId(),
  volume: denormalizeId('volumeId'),
});

export default Mount;
