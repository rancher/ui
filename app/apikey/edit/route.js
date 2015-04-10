import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('apikey');
  },

  setupController: function(controller, model) {
    controller.set('originalModel',model);
    controller.set('model', model.clone());
    controller.initFields();
  },

  resetController: function(controller/*, isExisting, transition*/) {
    controller.set('justCreated', false);
  },

  renderTemplate: function() {
    this.render('apikey/edit', {into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('apikeys');
    },
  }
});
