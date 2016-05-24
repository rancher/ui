import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  expectHosts: function() {
    return ( this.get('projects.current.mesos') ? 3 : 1);
  }.property('projects.current.mesos'),

  hasHosts: function() {
    return (this.get('model.hosts.length') + this.get('model.machines.length')) >= this.get('expectHosts');
  }.property('model.hosts.length','model.machines.length'),

  actions: {
    kubernetesReady() {
      this.send('refreshKubernetes');
      this.get('projects').updateOrchestrationState().then(() => {
        this.transitionToRoute('k8s-tab');
      });
    },

    swarmReady() {
      this.get('projects').updateOrchestrationState().then(() => {
        this.transitionToRoute('swarm-tab');
      });
    },

    mesosReady() {
      this.get('projects').updateOrchestrationState().then(() => {
        this.transitionToRoute('mesos-tab');
      });
    },
  },
});
