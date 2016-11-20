import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['project-upgrade'],

  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  canUpgrade: function() {
    return this.get('access').isOwner();
  }.property('projects.current.id'),

  actions: {
    upgrade() {
      this.get('projects.current').doAction('upgrade');
    },
  },
});
