import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    $('BODY').addClass('white');
  },

  willDestroyElement: function() {
    $('BODY').removeClass('white');
  },
});
