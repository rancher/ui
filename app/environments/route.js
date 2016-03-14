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
    var hasK8s = this.controllerFor('authenticated').get('hasKubernetes');
    controller.set('which', (hasK8s ? C.EXTERNALID.KIND_NOT_KUBERNETES : C.EXTERNALID.KIND_USER));
  },
});
