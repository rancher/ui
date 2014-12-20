import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('host');
  },

  actions: {
    newContainer: function() {
      this.transitionTo('newContainer');
    },
  },
});
