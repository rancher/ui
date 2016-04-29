import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  redirect() {
    if ( this.get('projects.current.kubernetes') )
    {
      this.replaceWith('k8s-tab');
    }
    else if ( this.get('projects.current.swarm') )
    {
      this.replaceWith('swarm-tab');
    }
    else if ( this.get('projects.current.mesos') )
    {
      this.replaceWith('applications-tab');
    }
    else
    {
      this.replaceWith('applications-tab');
    }
  },
});
