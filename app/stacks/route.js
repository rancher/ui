import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model: function() {
    return Ember.RSVP.hash({
      stacks: this.get('store').findAll('stack'),
    });
  },

  resetController: function (controller/*, isExisting, transition*/) {
    if ( this.get('projects.current.orchestrationState.hasKubernetes') ||
        this.get('projects.current.orchestrationState.hasSwarm') ||
        this.get('projects.current.orchestrationState.hasMesos') ) {
      controller.set('which', C.EXTERNAL_ID.KIND_INFRA);
    } else {
      controller.set('which', C.EXTERNAL_ID.KIND_USER);
    }
  },
});
