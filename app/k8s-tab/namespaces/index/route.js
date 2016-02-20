import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.Object.create({
      allNamespaces: this.modelFor('k8s-tab.namespaces'),
    });
  },
});
