import Ember from 'ember';

export default Ember.Controller.extend({
  environments: Ember.inject.controller(),
  mode: Ember.computed.alias('environments.mode'),

  actions: {
    addService: function() {
      this.get('controllers.environment').send('addService');
    },
    addBalancer: function() {
      this.get('controllers.environment').send('addBalancer');
    },
  },
});
