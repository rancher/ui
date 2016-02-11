import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  settings: Ember.inject.service(),
  projects: Ember.inject.service(),
  currentPath: Ember.computed.alias('application.currentPath'),
  error: null,

  // These are set by project/route and project/controller
  hasKubernetes: false,
  hasSystem: false,
  hasVm: Ember.computed.alias('settings.hasVm'),
});
