import Cattle from 'ui/utils/cattle';

var Service = Cattle.TransitioningResource.extend({
  type: 'service',

  consumedServicesUpdated: 0,
  onConsumedServicesChanged: function() {
    this.incrementProperty('consumedServicesUpdated');
  }.observes('consumedservices.@each.{id,name,state}'),

  healthState: function() {
    // Get the state of each instance
    var healthy = 0;
    (this.get('instances')||[]).forEach((instance) => {
      var resource = instance.get('state');
      var health = instance.get('healthState');

      if ( ['running','active','updating-active'].indexOf(resource) >= 0 && health === 'healthy' )
      {
        healthy++;
      }
    });

    if ( healthy >= this.get('scale') )
    {
      return 'healthy';
    }
    else
    {
      return 'unhealthy';
    }
  }.property('instances.@each.{state,healthState}'),

  combinedState: function() {
    var service = this.get('state');
    var health = this.get('healthState');
    if ( ['active','updating-active'].indexOf(service) === -1 )
    {
      // If the service isn't active, return its state
      return service;
    }

    if ( health === 'healthy' )
    {
      return service;
    }
    else
    {
      return 'degraded';
    }
  }.property('state', 'healthState'),
});

Service.reopenClass({
});

export default Service;
