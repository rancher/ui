import Cattle from 'ui/utils/cattle';

var Host = Cattle.TransitioningResource.extend({
  type: 'host',

  instancesUpdated: 0,
  onInstanceChanged: function() {
    this.incrementProperty('instancesUpdated');
  }.observes('instances.@each.{id,name,state}','instances.length'),

  state: function() {
    var host = this.get('hostState');
    var agent = this.get('agent.state');
    if ( host === 'active' && agent  )
    {
      return agent;
    }
    else
    {
      return host;
    }
  }.property('hostState','agent.state'),

  transitioning: function() {
    var host = this.get('hostTransitioning');
    var agent = this.get('agent.transitioning');
    if ( host === 'no' && agent )
    {
      return this.get('agent.transitioning');
    }
    else
    {
      return host;
    }
  }.property('hostTransitioning','agent.transitioning'),

  transitioningMessage: function() {
    if ( this.get('hostTransitioning') === 'no' && this.get('agent.transitioning'))
    {
      return this.get('agent.transitioningMessage');
    }
    else
    {
      return this.get('hostTransitioningMessage');
    }
  }.property('hostTransitioningMessage','agent.{transitioning,transitioningMessage}'),

  transitioningProgress: function() {
    if ( this.get('hostTransitioning') === 'no' && this.get('agent.transitioning'))
    {
      return this.get('agent.transitioningProgress');
    }
    else
    {
      return this.get('hostTransitioningProgress');
    }
  }.property('hostTransitioningProgress','agent.{transitioning,transitioningProgress}'),
});

Host.reopenClass({
  alwaysInclude: ['agent','instances','ipAddresses'],

  // Remap the host fields to host+[Field] so that the regular names can be a computed combination of host + agent status.
  mangleIn: function(data) {
    var keys = ['state','transitioning','transitioningMessage','transitioningProgress'];
    keys.forEach(function(key) {
      var newKey = 'host' + key.substr(0,1).toUpperCase() + key.substr(1);
      data[newKey] = data[key];
      delete data[key];
    });

    return data;
  },
});

export default Host;
