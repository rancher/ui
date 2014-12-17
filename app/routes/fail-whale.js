import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.controllerFor('application').get('error');
  },

  afterModel: function(model) {
    if ( !model )
    {
      this.transitionTo('hosts');
    }
  }
});
