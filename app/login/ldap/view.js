import Ember from "ember";

export default Ember.View.extend({
  didInsertElement: function() {
    $('BODY').addClass('farm');
  },

  willDestroyElement: function() {
    $('BODY').removeClass('farm');
  },
});
