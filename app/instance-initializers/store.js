import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('store:main');

  store.reopen(StoreTweaks);
  store.reopen({
    removeAfterDelete: false,
    baseUrl: application.apiEndpoint,
    skipTypeifyKeys: ['labels'],
  });
}

export default {
  name: 'store',
  after: 'ember-api-store',
  initialize: initialize
};
