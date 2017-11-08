import Controller from '@ember/controller';

export default Controller.extend({

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
