import Ember from 'ember';

export default Ember.Controller.extend({
  stack: Ember.computed.alias('model.stack'),

  showServiceInfo: null,
  selectedService: null,
  actions: {
    dismiss: function() {
      this.set('showServiceInfo',false);
    }
  }
});
