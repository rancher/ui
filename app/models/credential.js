import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var Credential = Resource.extend(PolledResource, {
  type: 'credential',
});

// Credentials don't get pushed by /subscribe WS, so refresh more often
Credential.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Credential;
