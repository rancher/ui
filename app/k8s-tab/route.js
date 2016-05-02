import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  beforeModel() {
    if ( !this.get('projects.current.orchestrationState.kubernetesReady') )
    {
      this.transitionTo('authenticated.project.waiting');
    }
  },

  model() {
    var k8s = this.get('k8s');
    return Ember.RSVP.hash({
      namespaces: k8s.allNamespaces(),
      services: k8s.allServices(),
      rcs: k8s.allRCs(),
      pods: k8s.allPods(),
      containers: this.get('store').findAll('container'),
    }).then((hash) => {
      return k8s.selectNamespace().then(() => {
        k8s.setProperties(hash);
      });
    });
  },
});
