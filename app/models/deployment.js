import Workload from 'ui/models/workload';
import { get, computed } from '@ember/object';

const Deployment = Workload.extend({
  combinedState: computed('state', 'isPaused', function() {
    var service = get(this, 'state');

    if (service === 'active' && get(this, 'isPaused')) {
      return 'paused';
    }

    return service;
  }),

  isPaused: computed('paused', function() {
    return !!get(this, 'paused');
  }),
});

export default Deployment;
