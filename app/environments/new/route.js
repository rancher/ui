import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    return this.get('store').createRecord({
      type: 'environment',
      startOnCreate: true,
    });
  },

  setupController: function(controller, model) {
    controller.set('originalModel',null);
    controller.set('model', model);
    controller.initFields();
  },

  actions: {
    cancel: function() {
      this.transitionTo('environments');
    },
  }
});
