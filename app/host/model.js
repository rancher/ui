import Cattle from 'ui/utils/cattle';

var Host = Cattle.TransitioningResource.extend({
  type: 'host',

  instancesUpdated: 0,
  onInstanceChanged: function() {
    this.incrementProperty('instancesUpdated');
  }.observes('instances.@each.{id,name,state}','instances.length'),

  state: function() {
    var host = this.get('hostState');
    var agent = this.get('agentState');
    if ( host === 'active' && agent )
    {
      return agent;
    }
    else
    {
      return host;
    }
  }.property('hostState','agentState'),
});

Host.reopenClass({
  alwaysInclude: ['instances','ipAddresses'],

  // Remap the host state to hostState so the regular state can be a computed combination of host+agent state.
  mangleIn: function(data) {
    data['hostState'] = data['state'];
    delete data['state'];
    return data;
  },
});

export default Host;
