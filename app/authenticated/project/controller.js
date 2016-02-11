import Ember from 'ember';
import C from 'ui/utils/constants';

export function hasThings(stacks, project, tgt)
{
  var keys = {
    hasSystem: false,
    hasKubernetes: !!project.get('kubernetes'),
  };

  (stacks||[]).forEach((stack) => {
    var info = stack.get('externalIdInfo');
    if ( C.EXTERNALID.SYSTEM_KINDS.indexOf(info.kind) >= 0 )
    {
      keys.hasSystem = true;
    }
    else if ( info.kind === C.EXTERNALID.KIND_CATALOG && info.id.match(/:kubernetes:/) )
    {
      keys.hasKubernetes = true;
    }
  });

  tgt.setProperties(keys);
}

export default Ember.Controller.extend({
  authenticated: Ember.inject.controller(),

  hasThingsChanged: function() {
    hasThings(this.get('model.stacks'), this.get('model.project'), this.get('authenticated'));
  }.observes('model.stacks.@each.externalId','model.project.kubernetes'),
});
