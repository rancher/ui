import Ember from 'ember';
import C from 'ui/utils/constants';

export function hasThings(stacks, project, tgt)
{
  var keys = {
    hasSystem: false,
    hasKubernetes: !!project.get('kubernetes'),
    hasSwarm: !!project.get('swarm'),
    hasMesos: !!project.get('mesos'),
  };

  (stacks||[]).forEach((stack) => {
    var info = stack.get('externalIdInfo');
    if ( C.EXTERNALID.SYSTEM_KINDS.indexOf(info.kind) >= 0 )
    {
      keys.hasSystem = true;
    }
  });

  tgt.setProperties(keys);
}

export default Ember.Controller.extend({
  authenticated: Ember.inject.controller(),

  hasThingsChanged: function() {
    hasThings(this.get('model.stacks'), this.get('model.project'), this.get('authenticated'));
  }.observes('model.stacks.@each.externalId','model.project.{kubernetes,swarm,mesos}'),
});
