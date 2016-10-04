import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model: function() {
    return this.get('store').findAll('stack');
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
