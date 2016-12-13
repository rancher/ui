import Ember from 'ember';

export default Ember.Controller.extend({
  stack: Ember.computed.alias('model.stack'),

  showServiceInfo: null,
  selectedService: null,
  noServices: false,
  actions: {
    dismiss: function() {
      this.set('showServiceInfo',false);
    },
    setNoServices: function(val) {
      this.set('noServices', val);
    }
  }
});
