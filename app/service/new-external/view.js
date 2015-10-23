import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    $('BODY').addClass('white');
  },

  willDestroyElement: function() {
    $('BODY').removeClass('white');
  },
});
