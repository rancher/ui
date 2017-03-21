import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function(model) {
    if (model.service.kind !== 'dnsService') {
      this.transitionTo('scaling-group.containers');
    } else {
      this.transitionTo('scaling-group.links');
    }
  }
});
