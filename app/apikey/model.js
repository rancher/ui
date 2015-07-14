import Resource from 'ember-api-store/models/resource';

var ApiKey = Resource.extend({
  type: 'apiKey',
  publicValue: null,
  secretValue: null,
});

ApiKey.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default ApiKey;
