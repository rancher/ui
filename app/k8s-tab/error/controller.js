import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  init() {
    this.get('projects.orchestrationState.kubernetesReady');
  },

  readyChanged: function() {
    if ( this.get('projects.orchestrationState.kubernetesReady') ) {
      this.set('k8s.loadingErrors', null);
      this.transitionToRoute('k8s-tab');
    }
  }.observes('projects.orchestrationState.kubernetesReady'),
});
