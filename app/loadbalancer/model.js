import Cattle from 'ui/utils/cattle';

var LoadBalancer = Cattle.TransitioningResource.extend({
  type: 'loadbalancer',
});

LoadBalancer.reopenClass({
});

export default LoadBalancer;
