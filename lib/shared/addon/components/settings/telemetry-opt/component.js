import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

const IN = 'in';
const OUT = 'out';

export default Component.extend({
  layout,
  settings: service(),

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

    debugger;
    let val = false;
    if ( this.get('initialValue') === IN ) {
      val = true;
    }

    this.set('optIn', val);
  },
});
