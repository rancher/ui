import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
    this.replaceWith('k8s-tab.services.index');
  },
});
