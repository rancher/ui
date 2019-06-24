import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { get } from '@ember/object';

export default Route.extend({
  settings:    service(),
  globalStore: service(),

  beforeModel() {
    return this.get('settings').load([
      C.SETTING.TELEMETRY,
    ]);
  },

  model() {
    // let settings = this.get('settings');
    let globalStore = get(this, 'globalStore');

    return globalStore.find('setting').then((settings) => {
      let serverUrl = settings.findBy('id', C.SETTING.SERVER_URL);

      return {
        telemetry:        settings.findBy('id', C.SETTING.TELEMETRY),
        serverUrl:        get(serverUrl, 'value') || window.location.host,
        serverUrlSetting: serverUrl,
      };
    });
  },

  resetController(controller, isExiting /* , transition*/ ) {
    if (isExiting) {
      controller.set('error', null);
    }
  }
});
