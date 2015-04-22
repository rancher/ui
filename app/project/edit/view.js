import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'projects/new',

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
