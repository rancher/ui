import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  redirect() {
    if ( this.get('k8s.namespaces.length') )
    {
      this.transitionTo('k8s-tab.namespace', this.get('k8s.namespaces.firstObject.id'));
    }
  },
});
