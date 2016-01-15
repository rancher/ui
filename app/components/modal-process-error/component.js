import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    dismiss: function() {
      this.sendAction('dismiss');
    }
  },
});
