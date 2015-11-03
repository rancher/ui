import Ember from 'ember';

export default Ember.Controller.extend({

  selectedService: null,
  showAddtlInfo: false,

  actions: {
    openInfo: function(service) {
      this.toggleProperty('showAddtlInfo');
      this.set('selectedService', service);
    },
    dismiss: function() {
      this.toggleProperty('showAddtlInfo');
    }
  },
});
