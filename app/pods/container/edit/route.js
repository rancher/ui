import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    cancel: function() {
      this.transitionTo('hosts');
    },
  },

  model: function() {
    var model = this.modelFor('container');
    return Ember.RSVP.all([
      model.importLink('ports'),
      model.importLink('instanceLinks')
    ]).then(function() {
      return model;
    });
  },

  setupController: function(controller, model) {
    controller.set('originalModel',model);
    controller.set('model', model.clone());
    controller.initFields();
  },

  renderTemplate: function() {
    this.render('container/edit', {into: 'application', outlet: 'overlay'});
  },
});
