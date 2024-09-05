import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

const IN = 'in';
const OUT = 'out';

export default Component.extend({
  settings: service(),

  layout,
  initialValue: null,
  optIn:        null,

  init() {
    this._super(...arguments);

    let val = false;

    if ( this.initialValue === IN ) {
      val = true;
    }

    this.set('optIn', val);
  },
  actions: {
    save(btnCb) {
      this.settings.set(C.SETTING.TELEMETRY, (this.optIn ? IN : OUT));
      this.settings.one('settingsPromisesResolved', () => {
        btnCb(true);
        if (this.saved) {
          this.saved();
        }
      });
    },
  },

});
