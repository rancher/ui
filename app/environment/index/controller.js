import Ember from 'ember';

export default Ember.Controller.extend({
  mode: 'grouped',
  queryParams: ['mode'],

  actions: {
    addService: function() {
      this.get('controllers.environment').send('addService');
    },
    addBalancer: function() {
      this.get('controllers.environment').send('addBalancer');
    },
  },
});
