import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  redirect() {
    if ( window.lc('authenticated').get('hasKubernetes') )
    {
      this.replaceWith('k8s-tab');
    }
    else
    {
      this.replaceWith('applications-tab');
    }
  },
});
