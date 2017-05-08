import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');
    var all = this.modelFor('stacks');
    return store.find('stack', params.stack_id).then((stack) => {
      var neu = [];
      stack.get('services').forEach((service) => {
        neu = neu.concat(service.get('instances'));
      });
      return Ember.Object.create({
        stack: stack,
        all: all,
        instances: neu,
        services: stack.get('services')
      });
    });
  },
});
