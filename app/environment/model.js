import Cattle from 'ui/utils/cattle';

var Environment = Cattle.TransitioningResource.extend({
  type: 'environment',
});

Environment.reopenClass({
  alwaysInclude: ['services'],
});

export default Environment;
