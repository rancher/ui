import Cattle from 'ui/utils/cattle';

var LoadBalancer = Cattle.TransitioningResource.extend({
  type: 'loadbalancer',
});

LoadBalancer.reopenClass({
  alwaysInclude: ['loadBalancerConfig','loadBalancerTargets','hosts'],
});

export default LoadBalancer;
