import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),
  model: function() {
    var store = this.get('store');

    return Ember.RSVP.hash({
      stacks: store.findAllUnremoved('stack'),
      services: store.find('service', null, {include: ['instances']})
    }).then((hash) => {
      hash.stacks.forEach((stack) => {
        let list = hash.services
          .filterBy('stackId',stack.get('id'))
          .filter((svc) => {
            return C.REMOVEDISH_STATES.indexOf(svc.get('state').toLowerCase()) === -1;
        });

        stack.set('services',list);
      });

      return hash.stacks;
    });
  },

  resetController: function (controller/*, isExisting, transition*/) {
    if ( this.get('projects.current.orchestrationState.hasKubernetes') ) {
      controller.set('which', C.EXTERNAL_ID.KIND_NOT_KUBERNETES);
    } else if ( this.get('projects.current.orchestrationState.hasSwarm') ) {
      controller.set('which', C.EXTERNAL_ID.KIND_NOT_SWARM);
    } else if ( this.get('projects.current.orchestrationState.hasMesos') ) {
      controller.set('which', C.EXTERNAL_ID.KIND_NOT_MESOS);
    } else {
      controller.set('which', C.EXTERNAL_ID.KIND_USER);
    }
  },
});
