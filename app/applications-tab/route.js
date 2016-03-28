import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model: function() {
    var store = this.get('store');
    return Ember.RSVP.all([
      store.findAllUnremoved('environment'),
      store.findAllUnremoved('service'),
      store.findAllUnremoved('serviceconsumemap'),
      store.findAllUnremoved('host'),
    ]).then((results) => {
      return Ember.Object.create({
        environments: results[0],
        services: results[1],
        consumeMaps: results[2],
        hosts: results[3],
      });
    });
  },

  afterModel: function(model /*, transition*/) {
    var ready = !!model.get('services.length') && !!model.get('hosts.length');
    var hasKubernetes = this.controllerFor('authenticated').get('hasKubernetes');
    var hasSwarm = this.controllerFor('authenticated').get('hasSwarm');

    if ( ready )
    {
      if ( this.controllerFor('authenticated').get('hasKubernetes') )
      {
        this.transitionTo('environments', this.get('projects.current.id'), {queryParams: {which: 'not-kubernetes'}});
      }
    }
    else
    {
      if ( hasSwarm )
      {
        this.transitionTo('applications-tab.compose-waiting');
      }
      else if ( hasKubernetes )
      {
        this.transitionTo('k8s-tab.waiting', this.get('projects.current.id'));
      }
      else
      {
        this.transitionTo('splash');
      }
    }
  }
});
