import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('registry');
  },

  setupController: function(controller, model) {
    controller.set('originalModel',model);
    controller.set('model', model.clone());
  },

  renderTemplate: function() {
    this.render({into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('registries');
    },
  }
});
