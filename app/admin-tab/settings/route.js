import Ember from 'ember';
import C from 'ui/utils/constants';
import {denormalizeName} from 'ui/services/settings';

export default Ember.Route.extend({
  endpoint: Ember.inject.service(),
  settings: Ember.inject.service(),

  model: function() {
    return Ember.RSVP.all([
      this.get('store').find('setting', denormalizeName(C.SETTING.API_HOST)),
      this.get('store').find('setting', denormalizeName(C.SETTING.CATALOG_URL)),
      this.get('store').find('setting', denormalizeName(C.SETTING.VM_ENABLED)),
    ]).then((/* response */) => {
      return Ember.Object.create({
        host: this.get('settings').get(C.SETTING.API_HOST),
        catalog: this.get('settings').get(C.SETTING.CATALOG_URL),
        vm: this.get('settings').get(C.SETTING.VM_ENABLED) || false,
      });
    });
  },

  setupController: function(controller, model) {
    /*not sure we need this anymore except maybe to set error to null?*/
    controller.set('model', model);
    controller.set('error', null);
  },

  resetController: function(controller, isExiting /*, transition*/ ) {
    if (isExiting) {
      controller.set('backToAdd', false);
    }
  }
});
