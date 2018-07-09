import EmberObject, { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  settings: service(),
  scope:    service(),

  beforeModel() {

    this._super(...arguments);

    return this.get('settings').load([
      C.SETTING.API_HOST,
      C.SETTING.TELEMETRY,
    ]);

  },

  model() {

    return get(this, 'scope').startSwitchToGlobal(false)
      .then(() => {

      // let settings = this.get('settings');

      // @TODO-2.0
        return EmberObject.create({
          host:      '',
          catalog:   '',
          telemetry: 'out',
        });

      // return this.get('globalStore').find('setting').then(() => {
      //   return EmberObject.create({
      //     host:      settings.get(C.SETTING.API_HOST),
      //     catalog:   settings.get(C.SETTING.CATALOG_URL),
      //     telemetry: settings.get(C.SETTING.TELEMETRY),
      //   });
      // });

      });

  },

  setupController(/* controller, model*/) {

    this._super(...arguments);
    get(this, 'scope').finishSwitchToGlobal();

  },

  resetController(controller, isExiting /* , transition*/ ) {

    if (isExiting) {

      controller.set('error', null);

    }

  }
});
