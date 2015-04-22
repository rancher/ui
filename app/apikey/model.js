import Cattle from 'ui/utils/cattle';

var ApiKey = Cattle.TransitioningResource.extend({
  type: 'apiKey',
  publicValue: null,
  secretValue: null,
});

ApiKey.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default ApiKey;
