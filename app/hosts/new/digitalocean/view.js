import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    this.$('INPUT')[0].focus();
  },
});
