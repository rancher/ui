import Ember from 'ember';

export default Ember.Route.extend({
  storeReset: Ember.inject.service(),

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
    if ( model ) {
      this.get('storeReset').reset();
    } else {
      this.transitionTo('authenticated');
    }
  }
});
