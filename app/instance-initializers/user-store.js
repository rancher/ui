import Ember from 'ember';
import StoreTweaks from 'ui/mixins/store-tweaks';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('store:user');

  store.reopen(StoreTweaks);
  store.reopen({
    removeAfterDelete: false,
    baseUrl: application.apiEndpoint,
    skipTypeifyKeys: ['labels'],
  });
}

export default {
  name: 'user-store',
  after: 'ember-api-store',
  initialize: initialize
};
