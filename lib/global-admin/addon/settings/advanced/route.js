import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { get } from '@ember/object';

export default Route.extend({
  settings: service(),
  globalStore: service(),

  model: function() {
    let globalStore = get(this, 'globalStore');

    return globalStore.find('setting', C.SETTING.SERVER_URL).then((serverUrl) => {
      return {
        serverUrl: get(serverUrl, 'value') || window.location.host,
        serverUrlSetting: serverUrl,
      };
    });
  },

  resetController(controller, isExiting /*, transition*/ ) {
    if (isExiting) {
      controller.set('error', null);
    }
  }
});
