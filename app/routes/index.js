import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    activate: function() {
      this.transitionTo('authenticated');
    },
  }
});
