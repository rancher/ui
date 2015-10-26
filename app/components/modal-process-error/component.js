import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement: function() {
    this.highlightAll();
  },
  actions: {
    dismiss: function() {
      this.sendAction('dismiss');
    }
  },
  highlightAll: function() {
    this.$('CODE').each(function(idx, elem) {
      Prism.highlightElement(elem);
    });
  },
});
