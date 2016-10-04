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
    if ( this.get('projects.current.orchestration') === 'mesos' )
    {
      if ( ((model.get('hosts')||[]).filterBy('state','active').get('length') >= 2) && this.get('projects.isReady') )
      {
        this.replaceWith('authenticated.project.index');
      }
    }
    else if ( model.get('hosts.length') > 0 && this.get('projects.isReady') )
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
