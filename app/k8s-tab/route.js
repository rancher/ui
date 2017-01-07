import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  'tab-session': Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);
    return this.get('projects').updateOrchestrationState();
  },

  model() {
    var auth = this.modelFor('authenticated');
    return this.get('store').findAll('container').then(() => {
      return auth;
    });
  },
});
