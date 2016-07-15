import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  model() {
    return this.get('k8s').allReplicaSets();
  },
});
