import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    var stack = this.get('store').createRecord({
      type: 'stack',
      templates: {
        'config.yml': ''
      },
    });

    return stack;
  },

  setupController: function(controller, model) {
    controller.set('originalModel',null);
    controller.set('model', model);
  },

  actions: {
    cancel: function() {
      this.goToPrevious();
    },
  }
});
