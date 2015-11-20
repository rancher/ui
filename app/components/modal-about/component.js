import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },
});
