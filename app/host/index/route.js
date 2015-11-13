import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    this.transitionTo('host.containers');
  },

  model: function() {
    return this.modelFor('host').get('host');
  }
});
