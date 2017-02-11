import Ember from 'ember';

export default Ember.Route.extend({
  activate: function() {
    $('BODY').addClass('container-farm');
  },

  deactivate: function() {
    $('BODY').removeClass('container-farm');
  }
});
