import Cattle from 'ui/utils/cattle';

var ExternalService = Cattle.TransitioningResource.extend({
  type: 'service',

  consumedServicesUpdated: 0,
  onConsumedServicesChanged: function() {
    this.incrementProperty('consumedServicesUpdated');
  }.observes('consumedservices.@each.{id,name,state}'),

  healthState: function() {
    return 'healthy';
  }.property(),

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

ExternalService.reopenClass({
});

export default ExternalService;
