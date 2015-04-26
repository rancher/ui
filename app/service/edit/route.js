import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    var store = this.get('store');
    var service = this.modelFor('service');

    var dependencies = [
      store.find('environment', service.get('environmentId')).then(function(env) {
        return env.importLink('services');
      })
    ];

    return Ember.RSVP.all(dependencies, 'Load service dependencies').then((results) => {
      return Ember.Object.create({
        service: service,
        selectedEnvironment: results[0],
      });
    });
  },

  setupController: function(controller, model) {
    var service = model.get('service');
    model.set('service', service.clone());
    controller.set('originalModel', service);
    controller.set('model', model);
    controller.initFields();
  },

  renderTemplate: function() {
    this.render('service/edit', {into: 'application', outlet: 'overlay'});
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
