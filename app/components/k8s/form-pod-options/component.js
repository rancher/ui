import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  tagName: null,

  advanced: false,

  actions: {
    toggleAdvanced() {
      this.set('advanced', !this.get('advanced'));
    },
  },
});
