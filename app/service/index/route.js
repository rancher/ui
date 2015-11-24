import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function(model) {
    if (model.service.kind !== 'dnsService') {
      this.transitionTo('service.containers');
    } else {
      this.transitionTo('service.links');
    }
  }
});
