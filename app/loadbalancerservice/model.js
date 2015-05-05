import Cattle from 'ui/utils/cattle';

var LoadBalancerService = Cattle.TransitioningResource.extend({
  type: 'service',

  consumedServicesUpdated: 0,
  onConsumedServicesChanged: function() {
    this.incrementProperty('consumedServicesUpdated');
  }.observes('consumedservices.@each.{id,name,state}'),
});

LoadBalancerService.reopenClass({
});

export default LoadBalancerService;
