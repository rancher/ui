import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  redirect() {
    if ( this.controllerFor('authenticated').get('hasKubernetes') )
    {
      this.replaceWith('k8s-tab');
    }
    else if ( this.controllerFor('authenticated').get('hasSwarm') )
    {
      this.replaceWith('swarm-tab.waiting');
    }
    else
    {
      this.replaceWith('applications-tab');
    }
  },
});
