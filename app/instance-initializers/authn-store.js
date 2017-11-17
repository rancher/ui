import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('service:authn-store');

  store.reopen(StoreTweaks);
  store.baseUrl = application.authenticationEndpoint;
}

export default {
  name: 'authn-store',
  initialize: initialize
};
