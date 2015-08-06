import Ember from "ember";

export default Ember.View.extend({
  didInsertElement: function() {
    $('BODY').addClass('farm');
    $('INPUT')[0].focus();
  },

  willDestroyElement: function() {
    $('BODY').removeClass('farm');
  },
});
