import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.modelFor('k8s-tab.namespace');
  },
});
