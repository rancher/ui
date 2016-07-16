import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    var auth = this.modelFor('authenticated');
    return this.get('projects').checkForWaiting(auth.get('hosts'),auth.get('machines'));
  },

  model() {
    var k8s = this.get('k8s');
    return Ember.RSVP.hash({
      namespaces: k8s.allNamespaces(),
      services: k8s.allServices(),
      rcs: k8s.allRCs(),
      pods: k8s.allPods(),
      deployments: k8s.allDeployments(),
      replicasets: k8s.allReplicaSets(),
      containers: this.get('store').findAll('container'),
    }).then((hash) => {
      return k8s.selectNamespace().then(() => {
        k8s.setProperties(hash);
      });
    });
  },

  deactivate: function() {
    $('BODY').removeClass('k8s');
  },
});
