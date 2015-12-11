import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');

    var promises = [
      store.findAllUnremoved('environment'),
    ];

    return Ember.RSVP.all(promises).then((results) => {
      var environments = results[0];

      var promises = [];
      environments.forEach((env) => {
        var promise = store.find('service', null, {
          filter: {
            environmentId: env.get('id'),
          },
          include: ['instances']
        }).then((services) => {
          env.set('services', services||[]);
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
