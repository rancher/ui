import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    $('BODY').addClass('white');
    this.$('INPUT')[0].focus();
  },

  willDestroyElement: function() {
    $('BODY').removeClass('white');
  },
});
