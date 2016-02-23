import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  model() {
    var k8s = this.get('k8s');

    return Ember.RSVP.hash({
      namespaces: k8s.allNamespaces(),
      services: k8s.allServices(),
      rcs: k8s.allRCs(),
      pods: k8s.allPods(),
    }).then((hash) => {
      return k8s.selectNamespace().then(() => {
        k8s.setProperties(hash);
      });
    });
  },
});
