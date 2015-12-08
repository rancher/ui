import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  endpoint: Ember.inject.service(),
  settings: Ember.inject.service(),

  model: function() {
    return this.get('store').findAll('setting').then((/* response */) => {
      return Ember.Object.create({
        host: this.get('settings').get(C.SETTING.API_HOST),
        catalog: this.get('settings').get(C.SETTING.CATALOG_URL),
        vm: this.get('settings').get(C.SETTING.VM_ENABLED),
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
