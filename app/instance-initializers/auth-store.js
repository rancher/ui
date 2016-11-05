import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('service:auth-store');

  store.reopen(StoreTweaks);
  store.reopen({
    baseUrl: application.authEndpoint,
    skipTypeifyKeys: ['labels'],
  });
}

export default {
  name: 'auth-store',
  initialize: initialize
};
