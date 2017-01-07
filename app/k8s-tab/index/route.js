import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
    this.transitionTo('k8s-tab.dashboard');
  },
});
