import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    var service = this.modelFor('service').get('service');
    return service;
  },
});
