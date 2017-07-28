import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  k8s: Ember.inject.service(),

  hosts: null,

  didReceiveAttrs() {
    this.set('hosts', this.get('store').all('host'));
  },

  expectHosts: 1,

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
  },
});
