import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params*/) {
    var balancer = this.modelFor('loadbalancer');
    var config = balancer.get('loadBalancerConfig');
    return config.followLink('loadBalancerListeners').then((listeners) => {
      return {
        balancer: balancer,
        config: config,
        listeners: listeners
      };
    });
  },
});
