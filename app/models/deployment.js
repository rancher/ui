import Workload from 'ui/models/workload';
import { computed } from '@ember/object';

const Deployment = Workload.extend({
  combinedState: computed('state', 'isPaused', function() {
    var service = this.state;

    if (service === 'active' && this.isPaused) {
      return 'paused';
    }

    return service;
  }),

  isPaused: computed('paused', function() {
    return !!this.paused;
  }),
});

export default Deployment;
