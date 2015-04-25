import Cattle from 'ui/utils/cattle';

var Service = Cattle.TransitioningResource.extend({
  type: 'service',

  consumedServicesUpdated: 0,
  onConsumedServicesChanged: function() {
    this.incrementProperty('consumedServicesUpdated');
  }.observes('consumedservices.@each.{id,name,state}'),
});

Service.reopenClass({
});

export default Service;
