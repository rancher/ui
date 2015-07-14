import Resource from 'ember-api-store/models/resource';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';

var Environment = Resource.extend({
  type: 'environment',

  healthState: function() {
    // Get the state of each instance
    var services = this.get('services')||[];
    var healthy = 0;
    var unremoved = 0;
    services.forEach((service) => {
      var resource = service.get('state');
      var health = service.get('healthState');

      if ( ['removing','removed','purging','purged'].indexOf(resource) >= 0 )
      {
        return;
      }

      unremoved++;

      if ( ['running','active','updating-active'].indexOf(resource) >= 0 && health === 'healthy' )
      {
        healthy++;
      }
    });

    if ( healthy >= unremoved )
    {
      return 'healthy';
    }
    else
    {
      return 'unhealthy';
    }
  }.property('services.@each.{state,healthState}'),

  combinedState: function() {
    var env = this.get('state');
    var health = this.get('healthState');
    if ( ['active','updating-active'].indexOf(env) === -1 )
    {
      // If the environment isn't active, return its state
      return env;
    }

    if ( health === 'healthy' )
    {
      return env;
    }
    else
    {
      return 'degraded';
    }
  }.property('state', 'healthState'),

  canActivate: function() {
    if ( !this.hasAction('activateservices') )
    {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 )
    {
      return false;
    }

    return this.get('services').filterProperty('actions.activate').get('length') > 0;
  }.property('services.@each.state','actions.activateservices'),

  canDeactivate: function() {
    if ( !this.hasAction('deactivateservices') )
    {
      return false;
    }

    var count = this.get('services.length') || 0;
    if ( count === 0 )
    {
      return false;
    }

    return this.get('services').filterProperty('actions.deactivate').get('length') > 0;
  }.property('services.@each.state','actions.deactivateservices'),


  unremovedServices: function() {
    return UnremovedArrayProxy.create({sourceContent: this.get('services')});
  }.property('services')
});

Environment.reopenClass({
  stateMap: {
    'active':           {icon: 'ss-globe',          color: 'text-success'},
  }
});

export default Environment;
