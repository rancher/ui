import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement() {
    $('BODY').addClass('white');
    this._super();
    this.$('INPUT')[0].focus();
  },

  willDestroyElement() {
    $('BODY').removeClass('white');
  },
});
