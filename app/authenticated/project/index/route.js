import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  redirect() {
    let orch = this.get('projects.current.orchestration');

    if ( orch === 'kubernetes' )
    {
      this.replaceWith('k8s-tab');
    }
    else if ( orch === 'swarm' )
    {
      this.replaceWith('swarm-tab');
    }
    else if ( orch === 'mesos' )
    {
      this.replaceWith('mesos-tab');
    }
    else
    {
      this.replaceWith('applications-tab');
    }
  },
});
