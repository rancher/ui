import Cattle from 'ui/utils/cattle';

var LoadBalancerListener = Cattle.TransitioningResource.extend({
  type: 'loadBalancerListener',
});

LoadBalancerListener.reopenClass({
});

export default LoadBalancerListener;
