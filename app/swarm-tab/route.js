import Ember from 'ember';
import ApplicationsTabRoute from 'ui/applications-tab/route';

export default ApplicationsTabRoute.extend({
  projects: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    return this.get('projects').updateOrchestrationState();
  },
});
