import Ember from 'ember';
import C from 'ui/utils/constants';

const IN = 'in';
const OUT = 'out';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  initialValue: null,
  optIn: null,

  actions: {
    save: function(btnCb) {
      this.get('settings').set(C.SETTING.TELEMETRY, (this.get('optIn') ? IN : OUT));
      this.get('settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.sendAction('saved');
      });
    },
  },

  init() {
    this._super(...arguments);

    let val = false;
    if ( this.get('initialValue') === IN ) {
      val = true;
    }

    this.set('optIn', val);
  },
});
