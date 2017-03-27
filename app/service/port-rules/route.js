import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let service = this.modelFor('service').get('service');
    service.initPorts();
    return service;
  }
});
