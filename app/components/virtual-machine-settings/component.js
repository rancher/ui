import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  settings       : Ember.inject.service(),
  virtualMachine : null,
  editing        : true,
  saving         : false,
  disableCancel  : true,

  actions: {
    save: function() {
      let vmValue  = this.get('virtualMachine');
      let propsOut = {};

      propsOut[C.SETTING.VM_ENABLED] = vmValue;

      this.set('saving', true);

      this.get('settings').setProperties(propsOut);
      this.get('settings').one('settingsPromisesResolved', () => {
        this.set('saving', false);
        this.set('errors', null);
      });
    },
    cancel: function() {},
  }
});
