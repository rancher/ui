import Ember from 'ember';

export default Ember.Controller.extend({
  service: Ember.computed.alias('model.service'),
  stack: Ember.computed.alias('model.stack'),
  application: Ember.inject.controller(),

  actions: {
    changeService(service) {
      var transitionTo = this.get('application.currentRouteName');

      if (service.type === 'dnsService') {
        transitionTo = 'service.links';
      }

      this.transitionToRoute(transitionTo, service.get('id'));
    }
  }
});
