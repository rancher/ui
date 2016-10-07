import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),
  redirect() {
    if ( this.get('k8s.supportsStacks') ) {
      this.transitionTo('k8s-tab.namespace.stacks');
    } else {
      this.transitionTo('k8s-tab.namespace.services');
    }
  },
});
