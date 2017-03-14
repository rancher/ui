import Ember from 'ember';

export default Ember.Controller.extend({
  stack: Ember.computed.alias('model.stack'),

  selectedService: null,
  noServices: false,
  actions: {
    setNoServices: function(val) {
      this.set('noServices', val);
    }
  }
});
