import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    return store.findAllUnremoved('environment').then((environments) => {
      var promises = []
      environments.forEach((env) => {
        var promise = store.find('service', null, {
          filter: {
            environmentId: env.get('id'),
          },
          include: ['consumedservices','instances']
        }).then((services) => {
          env.set('services', services||[]);
          env.set('services.sortProperties', ['name','id']);
          return env;
        });

        promises.push(promise);
      });

      return Ember.RSVP.all(promises).then(() => {
        return environments;
      });
    });
  },
});
