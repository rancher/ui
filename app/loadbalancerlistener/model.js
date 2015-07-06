import Resource from 'ember-api-store/models/resource';

var LoadBalancerListener = Resource.extend({
  type: 'loadBalancerListener',
});

LoadBalancerListener.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default LoadBalancerListener;
