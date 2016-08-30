import Ember from 'ember';

export default Ember.Controller.extend({
  showAddtlInfo: false,
  selectedService: null,

  actions: {
    showAddtlInfo: function(service) {
      this.set('selectedService', service);
      this.set('showAddtlInfo', true);
    },

    dismiss: function() {
      this.set('showAddtlInfo', false);
      this.set('selectedService', null);
    }
  },

  instanceCount: function() {
    var count = 0;
    (this.get('model.stack.services')||[]).forEach((service) => {
      count += service.get('instances.length')||0;
    });

    return count;
  }.property('model.stack.services.@each.healthState'),
});
