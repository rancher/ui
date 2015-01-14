import Ember from 'ember';

export default Ember.Route.extend({
  enter: function() {
    $('BODY').addClass('farm');
  },

  exit: function() {
    $('BODY').removeClass('farm');
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
