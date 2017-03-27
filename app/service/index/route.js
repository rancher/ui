import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function(model) {
    if (model.service.kind === 'dnsService') {
      this.transitionTo('service.links');
    } else {
      this.transitionTo('service.containers');
    }
  }
});
