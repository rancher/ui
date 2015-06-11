import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('environment');
  },

  setupController: function(controller, model) {
    var clone = model.clone();
    delete clone.services;
    controller.set('originalModel',model);
    controller.set('model', clone);
    controller.initFields();
  },

  renderTemplate: function() {
    this.render('environment/edit', {into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
