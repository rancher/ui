import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    $('BODY').addClass('white');
    this.$('INPUT')[0].focus();
    this._super();
  },

  willDestroyElement: function() {
    $('BODY').removeClass('white');
    this._super();
  },
});
