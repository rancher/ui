import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('service:store');
  var cookies = instance.lookup('service:cookies');

  store.reopen(StoreTweaks);
  store.baseUrl = application.apiEndpoint;

  let timeout = cookies.get('timeout');

  if ( timeout ) {
    store.defaultTimeout = timeout;
  }
}

export default {
  name:       'store',
  initialize
};
