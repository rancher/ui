import Ember from 'ember';

export default Ember.Controller.extend({
  showServiceInfo: null,
  selectedService: null,
  actions: {
    dismiss: function() {
      this.toggleProperty('showServiceInfo');
    }
  }
});
