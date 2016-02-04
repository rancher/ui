import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  settings: Ember.inject.service(),
  currentPath: Ember.computed.alias('application.currentPath'),
  error: null,

  hasKubernetes: false,
  hasSystem: false,
  hasVm: Ember.computed.alias('settings.hasVm'),

  externalIdChanged: function() {
    var hasKubernetes = false;
    var hasSystem = false;

    (this.get('model.stacks')||[]).forEach((stack) => {
      var info = stack.get('externalIdInfo');
      if ( C.EXTERNALID.SYSTEM_KINDS.indexOf(info.kind) >= 0 )
      {
        hasSystem = true;
      }
      else if ( info.kind === C.EXTERNALID.KIND_CATALOG && info.id.match(/:kubernetes:/) )
      {
        hasKubernetes = true;
      }
    });

    this.setProperties({
      hasKubernetes: hasKubernetes || true,
      hasSystem: hasSystem
    });
  }.observes('model.stacks.@each.externalId'),
});
