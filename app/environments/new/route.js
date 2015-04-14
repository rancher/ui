import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    return this.get('store').createRecord({
      type: 'environment'
    });
  },

  setupController: function(controller, model) {
    controller.set('originalModel',null);
    controller.set('model', model);
    controller.initFields();
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Back', backRoute: 'environments'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('environments');
    },
  }
});
