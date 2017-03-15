import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    return this.get('projects').updateOrchestrationState();
  },
});
