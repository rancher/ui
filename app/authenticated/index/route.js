import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  redirect: function(params, transition) {
    if ( this.get('projects.current.kubernetes') )
    {
      this.replaceWith('k8s-tab');
    }
    else
    {
      this.replaceWith('applications-tab');
    }
  },
});
