import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');

    return Ember.RSVP.hash({
      environments: store.findAllUnremoved('environment'),
      services: store.find('service', null, {include: ['instances']})
    }).then((hash) => {
      hash.environments.forEach((env) => {
        let list = hash.services
          .filterBy('environmentId',env.get('id'))
          .filter((svc) => {
            return C.REMOVEDISH_STATES.indexOf(svc.get('state').toLowerCase()) === -1;
        });

        env.set('services',list);
      });

      return hash.environments;
    });
  },

  resetController: function (controller/*, isExisting, transition*/) {
    if ( this.controllerFor('authenticated').get('hasKubernetes') ) {
      controller.set('which', C.EXTERNALID.KIND_NOT_KUBERNETES);
    } else if ( this.controllerFor('authenticated').get('hasSwarm') ) {
      controller.set('which', C.EXTERNALID.KIND_NOT_SWARM);
    } else if ( this.controllerFor('authenticated').get('hasMesos') ) {
      controller.set('which', C.EXTERNALID.KIND_NOT_MESOS);
    } else {
      controller.set('which', C.EXTERNALID.KIND_USER);
    }
  },
});
