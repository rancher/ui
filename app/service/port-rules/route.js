import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let service = this.modelFor('service').get('service');
    if ( service.get('type').toLowerCase() !== 'loadbalancerservice' ) {
      this.transitionTo('service.ports');
      return;
    }

    service.initPorts();
    return service;
  }
});
