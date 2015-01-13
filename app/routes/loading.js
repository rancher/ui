import Ember from 'ember';

export default Ember.Route.extend({
  enter: function() {
    console.log('Entering loading');

    Ember.run(function() {
      $('#loading-underlay').show().fadeIn({duration: 100, queue: false, easing: 'linear', complete: function() {
        $('#loading-overlay').show().fadeIn({duration: 200, queue: false, easing: 'linear'});
      }});
    });
  },

  exit: function() {
    console.log('Exiting loading');

    Ember.run(function() {
      $('#loading-underlay').fadeOut({duration: 100, queue: false, easing: 'linear', complete: function() {
        $('#loading-overlay').fadeOut({duration: 200, queue: false, easing: 'linear'});
      }});
    });

  },

  renderTemplate: function() {
  }
});
