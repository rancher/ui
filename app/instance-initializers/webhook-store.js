import StoreTweaks from 'ui/mixins/store-tweaks';
import Util from 'ui/utils/util';

export function initialize(instance) {
  var application = instance.lookup('application:main');
  var store = instance.lookup('service:webhook-store');
  var projects = instance.lookup('service:projects');

  store.reopen(StoreTweaks);
  store.reopen({
    removeAfterDelete: true,
    baseUrl: application.webhookEndpoint,

    normalizeUrl() {
      let out = this._super(...arguments);
      if ( out.indexOf('projectId=') === -1 ) {
        out = Util.addQueryParam(out, 'projectId', projects.get('current.id'));
      }
      return out;
    }
  });
}

export default {
  name: 'webhook-store',
  initialize: initialize
};
