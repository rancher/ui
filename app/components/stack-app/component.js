import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  classNames: ['stack-app'],

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
