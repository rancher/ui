import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('service:authz-store');

  store.reopen(StoreTweaks);
  store.baseUrl = application.authorizationEndpoint;
}

export default {
  name: 'authz-store',
  initialize: initialize
};
