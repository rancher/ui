import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    newRegistry: function() {
      this.transitionTo('registries.new');
    },
  },
});
