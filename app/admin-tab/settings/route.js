import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  beforeModel() {
    return this.get('settings').load([
      C.SETTING.API_HOST,
      C.SETTING.CATALOG_URL,
      C.SETTING.VM_ENABLED,
    ]);
  },

  model() {
    let settings = this.get('settings');

    return this.get('userStore').findAll('machinedriver', null, {forceReload: true}).then((drivers) => {
      return Ember.Object.create({
        host           : settings.get(C.SETTING.API_HOST),
        catalog        : settings.get(C.SETTING.CATALOG_URL),
        vm             : settings.get(C.SETTING.VM_ENABLED) || false,
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
