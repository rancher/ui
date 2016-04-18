import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    if ( this.controllerFor('authenticated').get('hasKubernetes') )
    {
      this.transitionTo('k8s-tab');
    }
    else if ( this.controllerFor('authenticated').get('hasSwarm') )
    {
      this.transitionTo('applications-tab.compose-projects');
    }
    else if ( this.controllerFor('authenticated').get('hasMesos') )
    {
      this.transitionTo('mesos-tab.waiting');
    }
    else
    {
      this.transitionTo('environments');
    }
  }
});
