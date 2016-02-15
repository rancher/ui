import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    var ns = this.modelFor('k8s-tab.namespace');
    return this.get('store').findAll('kubernetesreplicationcontroller').then((services) => {
      return Ember.Object.create({
        ns: ns,
        services: services,
      });
    });
  },
});
