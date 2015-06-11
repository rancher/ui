import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var store = this.get('store');
    return store.find('environment', params.environment_id).then((env) => {
      return store.find('service', null, {
        filter: {
          environmentId: env.get('id'),
        },
        include: ['instances']
      }).then((services) => {
        env.set('services', services||[]);
        env.set('services.sortProperties', ['name','id']);
        return env;
      });
    });
  },
});
