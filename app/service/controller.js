import Ember from 'ember';

export default Ember.Controller.extend({
  service: Ember.computed.alias('model.service'),
  stack: Ember.computed.alias('model.stack'),
  application: Ember.inject.controller(),

  actions: {
    changeService(service) {
      this.transitionTo(this.get('application.currentRouteName'), service.get('id'));
    }
  }
});
