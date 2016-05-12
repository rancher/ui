import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  beforeModel() {
    return this.get('settings').load([
      C.SETTING.API_HOST,
      C.SETTING.CATALOG_URL,
    ]);
  },

  model() {
    let settings = this.get('settings');

    return this.get('userStore').findAll('machinedriver', null, {forceReload: true}).then((drivers) => {
      return Ember.Object.create({
        host           : settings.get(C.SETTING.API_HOST),
        catalog        : settings.get(C.SETTING.CATALOG_URL),
        machineDrivers : drivers,
      });
    });
  },

  resetController(controller, isExiting /*, transition*/ ) {
    if (isExiting) {
      controller.set('error', null);
    }
  }
});
