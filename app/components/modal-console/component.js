import Ember from 'ember';

export default Ember.Component.extend({
  originalModel: null,

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    },
  },
});
