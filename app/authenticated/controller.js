import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  settings: Ember.inject.service(),
  currentPath: Ember.computed.alias('application.currentPath'),
  error: null,

  hasKubernetes: false,
  hasSystem: false,

  externalIdChanged: function() {
    var hasKubernetes = false;
    var hasSystem = false;

    (this.get('model.stacks')||[]).forEach((stack) => {
      var info = stack.get('externalIdInfo');
      if ( info.kind === C.EXTERNALID.KIND_SYSTEM )
      {
        hasSystem = true;
      }
      else if ( info.kind === C.EXTERNALID.KIND_CATALOG && info.id.match(/:kubernetes:/) )
      {
        hasKubernetes = true;
      }
    });

    console.log('k8s:', hasKubernetes, 'sys:', hasSystem);
    this.setProperties({
      hasKubernetes: hasKubernetes,
      hasSystem: hasSystem
    });
  }.observes('model.stacks.@each.externalId'),

  hasVm: Ember.computed.alias('settings.hasVm'),
  helpEnabled: Ember.computed.alias('settings.helpEnabled'),
});
