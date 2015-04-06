import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params*/) {
    var balancer = this.modelFor('loadbalancer');
    return balancer.importLink('hosts',{sort: 'name', include: 'ipAddresses'}).then(() => {
      return balancer;
    });
  }
});
