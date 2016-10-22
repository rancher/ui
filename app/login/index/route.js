import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    $('BODY').addClass('farm');
  },

  deactivate: function() {
    $('BODY').removeClass('farm');
  }
});
