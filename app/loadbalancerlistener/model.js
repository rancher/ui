import Cattle from 'ui/utils/cattle';

var LoadBalancerListener = Cattle.TransitioningResource.extend({
  type: 'loadBalancerListener',
});

LoadBalancerListener.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default LoadBalancerListener;
