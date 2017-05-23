import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');
    return store.find('stack', params.stack_id).then((stack) => {
      return Ember.Object.create({
        stack: stack,
        instances: store.all('instance'),
        services: stack.get('services')
      });
    });
  },
});
