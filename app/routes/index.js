import Ember from 'ember';

export default Ember.Route.extend({
  enter: function() {
    this.transitionTo('hosts');
  }
});
