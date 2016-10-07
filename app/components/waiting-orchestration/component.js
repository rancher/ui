import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  k8s: Ember.inject.service(),

  hosts: null,

  didReceiveAttrs() {
    this.set('hosts', this.get('store').all('host'));
  },

  expectHosts: function() {
    return ( this.get('projects.current.orchestration') === 'mesos' ? 3 : 1);
  }.property('projects.current.orchestration'),

  hasHosts: function() {
    return this.get('hosts.length') >= this.get('expectHosts');
  }.property('hosts.length'),

  actions: {
    kubernetesReady() {
      this.get('k8s').allNamespaces().then(() => {
        this.get('projects').updateOrchestrationState().then(() => {
          this.transitionToRoute('k8s-tab');
        });
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
