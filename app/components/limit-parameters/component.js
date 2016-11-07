import Ember from 'ember';

export default Ember.Component.extend({
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
  memoryReservationChanged: Ember.observer('memoryLimit', function() {
    var mem = this.get('memoryLimit');

    if ( isNaN(mem) || mem <= 0) {
      this.set('model.memory', '');
    }
    else {
      this.set('model.memory', mem * 1048576);
    }
  }),
});
