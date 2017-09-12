import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import { formatSi } from 'ui/utils/util';

var Instance = Resource.extend({
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

Instance.reopenClass({
  mangleIn(data) {
    if (data.hasOwnProperty('init')) {
      data._init = data.init;
      delete data.init;
      return data;
    }
  }

});


export default Instance;
