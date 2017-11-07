import { observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  memoryLimit: null,
  init: function() {
    this._super(...arguments);
    var memReservation = this.get('model.memory');
    if (memReservation) {
      this.set('memoryLimit', parseInt(memReservation,10)/1048576);
    } else {
      this.set('memoryLimit', '');
    }
  },
  memoryReservationChanged: observer('memoryLimit', function() {
    var mem = this.get('memoryLimit');

    if ( isNaN(mem) || mem <= 0) {
      this.set('model.memory', '');
    }
    else {
      this.set('model.memory', mem * 1048576);
    }
  }),
});
