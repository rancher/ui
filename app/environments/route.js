import Ember from 'ember';
import C from 'ui/utils/constants';

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

  resetController: function (controller/*, isExisting, transition*/) {
    if ( this.controllerFor('authenticated').get('hasKubernetes') ) {
      controller.set('which', C.EXTERNALID.KIND_NOT_KUBERNETES);
    } else if ( this.controllerFor('authenticated').get('hasSwarm') ) {
      controller.set('which', C.EXTERNALID.KIND_NOT_SWARM);
    } else {
      controller.set('which', C.EXTERNALID.KIND_USER);
    }
  },
});
