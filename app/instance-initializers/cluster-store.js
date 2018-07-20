import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var clusterStore = instance.lookup('service:clusterStore');
  var cookies = instance.lookup('service:cookies');

  clusterStore.reopen(StoreTweaks);
  clusterStore.baseUrl = application.clusterEndpoint;

  let timeout = cookies.get('timeout');

  if ( timeout ) {
    clusterStore.defaultTimeout = timeout;
  }
}

export default {
  name:       'cluster-store',
  initialize
};
