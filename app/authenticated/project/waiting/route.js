import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model() {
    return this.modelFor('authenticated');
  },

  afterModel() {
    return this.get('projects').updateOrchestrationState().then(() => {
      this.redirectIfReady();
    });
  },

  redirectIfReady() {
    let model = this.modelFor('authenticated');
    if ( (model.get('hosts.length') + model.get('machines.length')) > 0 && this.get('projects.isReady') )
    {
      this.replaceWith('authenticated.project.index');
    }
  },

  interval: null,
  activate() {
    this.set('interval', setInterval(() => {
      this.redirectIfReady();
    }, 1000));
  },

  deactivate() {
    clearInterval(this.get('interval'));
  },

});
