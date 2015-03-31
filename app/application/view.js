import Ember from "ember";

export default Ember.View.extend({
  didInsertElement: function() {
    this.$().tooltip({
      selector: '*[tooltip]',
      animation: false,
      title: function() {
        return $(this).attr('tooltip');
      }
    });
  }
});
