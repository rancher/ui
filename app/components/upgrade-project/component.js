import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['upgrade-project'],

  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  actions: {
    upgrade() {
      this.get('projects.current').doAction('upgrade');
    },
  },
});
