import Cattle from 'ui/utils/cattle';
import C from 'ui/utils/constants';

var Project = Cattle.TransitioningResource.extend({
  type: 'project',
  name: null,
  description: null,
  externalId: null,
  externalIdType: null
});

// Projects don't get pushed by /subscribe WS, so refresh more often
Project.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,

  headers: {
    [C.PROJECT_HEADER]: undefined, // Don't send project ID header for any requests to that type
  }

});

export default Project;
