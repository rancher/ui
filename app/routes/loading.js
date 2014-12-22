import Ember from 'ember';

export default Ember.Route.extend({
  enter: function() {
    console.log('Entering loading');
  },

  exit: function() {
    console.log('Exiting loading');
  },
});
