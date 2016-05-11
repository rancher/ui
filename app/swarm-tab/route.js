import Ember from 'ember';
import ApplicationsTabRoute from 'ui/applications-tab/route';

export default ApplicationsTabRoute.extend({
  projects: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    var auth = this.modelFor('authenticated');
    return this.get('projects.current').checkForWaiting(auth.get('hosts'),auth.get('machines'));
  },
});
