import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var registry =  this.modelFor('registry');
    return Ember.Object.create({
      registry: registry,
      credential: registry.get('credentials.firstObject')
    });
  },

  setupController: function(controller, model) {
    var registry = model.get('registry');
    var credential = model.get('credential');
    model.set('registry', registry.clone());
    model.set('credential', credential.clone());

    controller.set('originalModel', credential);
    controller.set('model', model);
    controller.initFields();
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
