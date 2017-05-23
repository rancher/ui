import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { formatSi } from 'ui/utils/util';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  stack: denormalizeId('stackId'),

  isSystem: function() {
    if ( this.get('system') ) {
      return true;
    }

    let labels = this.get('labels');
    return labels && !!labels[C.LABEL.SYSTEM_TYPE];
  }.property('system','labels'),

  memoryReservationBlurb: Ember.computed('memoryReservation', function() {
    if ( this.get('memoryReservation') ) {
      return formatSi(this.get('memoryReservation'), 1024, 'iB', 'B');
    }
  }),
});
