import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['environments'],
  mode: Ember.computed.alias('controllers.environments.mode'),

  actions: {
    addService: function() {
      this.get('controllers.environment').send('addService');
    },
    addBalancer: function() {
      this.get('controllers.environment').send('addBalancer');
    },
  },
});
