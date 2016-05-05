import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('authenticated');
  },

  afterModel: function(model) {
    if ( (model.get('hosts.length') + model.get('machines.length')) > 0 && model.get('project.isReady') )
    {
      this.replaceWith('authenticated.project.index');
    }
  }
});
