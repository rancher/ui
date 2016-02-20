import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Ember.Object.create({
      namespace: this.modelFor('k8s-tab.namespace'),
      allPods: this.modelFor('k8s-tab.namespace.pods'),
    });
  },
});
