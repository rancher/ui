import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    var auth = this.modelFor('authenticated');
    return this.get('projects').checkForWaiting(auth.get('hosts'));
  },
});
