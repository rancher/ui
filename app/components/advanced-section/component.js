import Ember from 'ember';

export default Ember.Component.extend({
  advanced: false,

  tagName: null,

  actions: {
    toggle() {
      this.set('advanced', !this.get('advanced'));
    },
  },
});
