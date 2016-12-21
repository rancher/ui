import StoreTweaks from 'ui/mixins/store-tweaks';
import C from 'ui/utils/constants';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('service:webhook-store');
  var projects = instance.lookup('service:projects');

  store.reopen(StoreTweaks);
  store.reopen({
    removeAfterDelete: false,
    baseUrl: application.webhookEndpoint,

    headers: function() {
      return {
        [C.HEADER.PROJECT]: projects.get('current.id'),
      };
    }.property().volatile(),
  });
}

export default {
  name: 'webhook-store',
  initialize: initialize
};
