import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');
    var all = this.modelFor('environments');
    return store.find('environment', params.environment_id).then((env) => {
      return store.find('service', null, {
        filter: {
          environmentId: env.get('id'),
        },
        include: ['instances']
      }).then((services) => {
        env.set('services', services||[]);
        return Ember.Object.create({
          stack: env,
          all: all,
        });
      });
    });
  },
});
