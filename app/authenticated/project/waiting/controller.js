import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  authenticated: Ember.inject.controller(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  docsBase: C.EXT_REFERENCES.DOCS,

  isReadyChanged: function() {
    //console.log(this.get('application.currentRouteName'),this.get('model.hosts.length'),this.get('model.services.length'));
    if ( this.get('application.currentRouteName') === 'authenticated.project.waiting')
    {
      if ( this.get('authenticated.ready') )
      {
        this.replaceRoute('authenticted.project.index');
      }
    }
  }.observes('authenticated.isReady'),

  hasHosts: Ember.computed.or('model.hosts.length','model.machines.length'),

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
