import Ember from 'ember';

export default Ember.Controller.extend({
  application : Ember.inject.controller(),
  settings    : Ember.inject.service(),
  projects    : Ember.inject.service(),
  currentPath : Ember.computed.alias('application.currentPath'),
  error       : null,

  // These are set by project/route and project/controller
  hasKubernetes : false,
  hasSwarm      : false,
  hasSystem     : false,
  hasVm         : Ember.computed.alias('settings.hasVm'),

  init() {
    this._super();
    this.k8sChanged();
  },

  k8sChanged: function() {
    this.set('hasKubernetes', !!this.get('projects.current.kubernetes'));
  }.observes('projects.current.kubernetes'),

  swarmChanged: function() {
    this.set('hasSwarm', !!this.get('projects.current.swarm'));
  }.observes('projects.current.swarm'),

  isPopup: Ember.computed.alias('application.isPopup'),
});
