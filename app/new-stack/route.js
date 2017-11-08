import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    var stack = this.get('store').createRecord({
      type: 'stack',
      templates: {
        'compose.yml': ''
      },
    });

    return stack;
  },

  setupController(controller, model) {
    controller.set('originalModel',null);
    controller.set('model', model);
  },

  actions: {
    cancel() {
      this.goToPrevious();
    },
  }
});
