import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  settings       : Ember.inject.service(),
  virtualMachine : null,

  actions: {
    save: function(btnCb) {
      this.get('settings').set(C.SETTING.VM_ENABLED, this.get('virtualMachine'));
      this.get('settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.sendAction('saved');
      });
    },
  }
});
