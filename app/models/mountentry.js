import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  isReadWrite: Ember.computed.equal('permission','rw'),
  isReadOnly:  Ember.computed.equal('permission','ro'),

  instance: denormalizeId('instanceId'),
  volume: denormalizeId('volumeId'),

  displayVolumeName: function() {
    let name = this.get('volumeName');
    if ( name.match(/^[0-9a-f]{64}$/) ) {
      return (name.substr(0,12)+'&hellip;').htmlSafe();
    }

    return name;
  }.property('volumeName'),
});
