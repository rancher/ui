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
    if ( !model.get('services.length') || !model.get('hosts.length') )
    {
      if ( this.controllerFor('authenticated').get('hasSwarm') )
      {
        this.transitionTo('applications-tab.compose-waiting');
      }
      else if ( this.controllerFor('authenticated').get('hasKubernetes') )
      {
        this.transitionTo('environments', this.get('projects.current.id'), {queryParams: {which: 'not-kubernetes'}});
      }
      else
      {
        this.transitionTo('splash');
      }
    }
  }
});
