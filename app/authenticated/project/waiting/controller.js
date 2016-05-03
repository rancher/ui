import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  docsBase: C.EXT_REFERENCES.DOCS,

  onInit: function() {
    // Can't observe until you get()
    this.get('projects.current.isReady');
  }.on('init'),

  isReadyChanged: function() {
    if ( ['loading','authenticated.project.waiting'].indexOf(this.get('application.currentRouteName')) >= 0 )
    {
      if ( this.get('hasHosts') && this.get('projects.current.isReady') )
      {
        this.replaceRoute('authenticated.project.index');
      }
    }
  }.observes('projects.current.isReady'),

  hasHosts: function() {
    return (this.get('model.hosts.length') + this.get('model.machines.length')) > 0;
  }.property('model.hosts.length','model.machines.length'),

  actions: {
    kubernetesReady() {
      this.send('refreshKubernetes');
      this.get('projects.current').updateOrchestrationState().then(() => {
        this.transitionToRoute('k8s-tab');
      });
    },

    swarmReady() {
      this.get('projects.current').updateOrchestrationState().then(() => {
        this.transitionToRoute('swarm-tab');
      });
    },

    mesosReady() {
      this.get('projects.current').updateOrchestrationState().then(() => {
        this.transitionToRoute('mesos-tab');
      });
    },
  },
});
