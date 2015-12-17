import Ember from 'ember';
import C from 'ui/utils/constants';
import {denormalizeName} from 'ui/services/settings';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  beforeModel() {
    var store = this.get('store');
    return Ember.RSVP.all([
      store.find('setting', denormalizeName(C.SETTING.API_HOST)),
      store.find('setting', denormalizeName(C.SETTING.CATALOG_URL)),
      store.find('setting', denormalizeName(C.SETTING.VM_ENABLED)),
    ]);
  },

  model() {
    var settings = this.get('settings');
    return Ember.Object.create({
      host:     settings.get(C.SETTING.API_HOST),
      catalog:  settings.get(C.SETTING.CATALOG_URL),
      vm:       settings.get(C.SETTING.VM_ENABLED) || false,
    });
  },

  resetController(controller, isExiting /*, transition*/ ) {
    if (isExiting) {
      controller.set('backToAdd', false);
      controller.set('error', null);
    }
  }
});
