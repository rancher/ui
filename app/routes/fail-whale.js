import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    activate: function() {
      $('BODY').addClass('farm');
    },

    deactivate: function() {
      $('BODY').removeClass('farm');
    },
  },

  model: function() {
    return this.controllerFor('application').get('error');
  },

  afterModel: function(model) {
    if ( !model )
    {
      this.transitionTo('index');
    }
  }
});
