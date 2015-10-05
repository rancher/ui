import Ember from 'ember';

export default Ember.ObjectController.extend({
  mode: 'grouped',
  queryParams: ['mode'],

  needs: ['environment'],
  actions: {
    addService: function() {
      this.get('controllers.environment').send('addService');
    },
    addBalancer: function() {
      this.get('controllers.environment').send('addBalancer');
    },
  },
});
