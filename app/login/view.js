import Ember from "ember";

export default Ember.View.extend({
  didInsertElement: function() {
    $('BODY').addClass('farm');
    var user = this.$('.login-user')[0];
    var pass = this.$('.login-pass')[0];
    if ( user )
    {
      if ( user.value )
      {
        pass.focus();
      }
      else
      {
        user.focus();
      }
    }
  },

  willDestroyElement: function() {
    $('BODY').removeClass('farm');
  },
});
