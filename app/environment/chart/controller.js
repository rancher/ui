import Ember from 'ember';

export default Ember.Controller.extend({

  selectedService: null,
  showAddtlInfo: false,

  actions: {
    openInfo: function(service) {
      this.set('selectedService', service);
      this.set('showAddtlInfo',true);
    },
    dismiss: function() {
      this.set('showAddtlInfo',false);
    }
  },
});
