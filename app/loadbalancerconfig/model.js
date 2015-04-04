import Cattle from 'ui/utils/cattle';

var LoadBalancerConfig = Cattle.TransitioningResource.extend({
  type: 'loadBalancerConfig',
});

LoadBalancerConfig.reopenClass({
});

export default LoadBalancerConfig;
