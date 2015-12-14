import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  settings: Ember.inject.service(),
  currentPath: Ember.computed.alias('application.currentPath'),
  error: null,

  hasKubernetes: function() {
    var found = false;
    this.get('model.stacks').forEach((stack) => {
      var info = stack.get('externalIdInfo');
      if ( info.kind === C.EXTERNALID.KIND_CATALOG && info.id.match(/:kubernetes:/) )
      {
        found = true;
      }
    });

    return found;
  }.property('model.stacks.@each.externalId'),

  hasVm: Ember.computed.alias('settings.hasVm'),
});
