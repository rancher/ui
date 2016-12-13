import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var Password = Resource.extend(PolledResource, {
  type: 'password',
});

// Passwords don't get pushed by /subscribe WS, so refresh more often
Password.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Password;
