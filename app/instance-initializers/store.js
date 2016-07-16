import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('store:main');
  var cookies = instance.lookup('service:cookies');

  store.reopen(StoreTweaks);
  store.reopen({
    removeAfterDelete: false,
    baseUrl: application.apiEndpoint,
    skipTypeifyKeys: ['labels'],
  });

  let timeout = cookies.get('timeout');
  if ( timeout ) {
    store.defaultTimeout = timeout;
  }
}

export default {
  name: 'store',
  after: 'ember-api-store',
  initialize: initialize
};
