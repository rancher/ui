
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  userStore: service('user-store'),
  settings: service(),

  beforeModel() {
    return this.get('settings').load([
      C.SETTING.TELEMETRY,
    ]);
  },

  model() {
    let settings = this.get('settings');

    return this.get('userStore').find('setting').then(() => {
      return EmberObject.create({
        telemetry: settings.get(C.SETTING.TELEMETRY),
      });
    });
  },

  resetController(controller, isExiting /*, transition*/ ) {
    if (isExiting) {
      controller.set('error', null);
    }
  }
});
