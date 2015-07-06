import Resource from 'ember-api-store/models/resource';

var LoadBalancer = Resource.extend({
  type: 'loadbalancer',
});

LoadBalancer.reopenClass({
  alwaysInclude: ['loadBalancerConfig','loadBalancerTargets','hosts'],
});

export default LoadBalancer;
