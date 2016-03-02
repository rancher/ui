import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  redirect() {
    if ( !this.modelFor('authenticated').kubernetesReady )
    {
      this.transitionTo('k8s-tab.waiting');
    }
  },

  model() {
    var k8s = this.get('k8s');
    if ( this.modelFor('authenticated').kubernetesReady )
    {
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
    }
  },
});
