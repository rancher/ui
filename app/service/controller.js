import Ember from 'ember';

export default Ember.Controller.extend({
  service: Ember.computed.alias('model.service'),
  stack: Ember.computed.alias('model.stack'),

  actions: {
    changeService(service) {
      this.transitionTo('service', service.get('id'));
    }
  }
});
