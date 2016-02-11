import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  model() {
    var store = this.get('store');
    // Kubernetes schemas are dynamic and not loaded by the initial /v1/schemas
    return Ember.RSVP.all([
      store.find('schema','kubernetesservice'),
      store.find('schema','kubernetesreplicationcontroller'),
    ]).then(() => {
      return store.findAllUnremoved('environment').then((namespaces) => {
        this.set('k8s.namespaces', namespaces);
        return namespaces;
      });
    });
  },
});
