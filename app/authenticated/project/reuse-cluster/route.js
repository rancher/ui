import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      clusters: this.get('userStore').find('cluster'),
      project: this.get('projects.current').clone(),
    });
  },
});
