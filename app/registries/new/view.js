import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();

    var numDrivers = this.get('context.drivers').filter((driver) => {
      return Ember.get(driver,'available');
    }).length;

    var width = this.$('#providers LI').width();
    this.$('#providers').css('margin','0 auto');
    this.$('#providers').css('max-width', Math.min(numDrivers, 4) * width + 'px');
  }
});
