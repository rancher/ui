import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');
    var all = this.modelFor('stacks');
    return store.find('stack', params.stack_id).then((stack) => {
      return store.find('service', null, {
        filter: {
          stackId: stack.get('id'),
        },
      }).then((services) => {
        stack.set('services', services||[]);
        return Ember.Object.create({
          stack: stack,
          all: all,
        });
      });
    });
  },
});
