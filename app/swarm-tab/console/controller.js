import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  available: function() {
    return this.get('projects.orchestrationState.swarmReady') && this.get('model.instance').hasAction('execute');
  }.property('model.instance.actionLinks.execute','projects.orchestrationState.swarmReady'),
});
