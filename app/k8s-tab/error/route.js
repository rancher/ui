import Ember from 'ember';

export default Ember.Route.extend({
  k8s: Ember.inject.service(),

  actions: {
    reload() {
      window.location.href = window.location.href;
    }
  },

  model() {
    let errors = this.get('k8s.loadingErrors');
    if ( errors && Ember.isArray(errors) && errors.get('length') )
    {
      return errors;
    }
    else
    {
      this.transitionTo('k8s-tab');
    }
  }
});
