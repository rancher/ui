import Ember from 'ember';
export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  actions: {
    kubernetesReady() {
      this.get('projects').updateOrchestrationState().then(() => {
        this.transitionToRoute('k8s-tab.index');
      });
    },
  }
});
