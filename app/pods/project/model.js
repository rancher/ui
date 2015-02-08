import Cattle from 'ui/utils/cattle';

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
});

export default Project;
