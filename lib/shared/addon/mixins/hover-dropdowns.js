import Mixin from '@ember/object/mixin';
import { next, cancel, later } from '@ember/runloop';
import { get, set } from '@ember/object';

export default Mixin.create({
  clostTimer: null,

  actions: {
    prevent() {
      return false;
    },

    open(dropdown) {
      const ct = get(this, 'clostTimer');

      if (ct) {

        next(() => {
          cancel(ct);
        });

        set(this, 'clostTimer', null);

      } else {

        next(() => {
          dropdown.actions.open();
        });

      }
    },

    closeLater(dropdown) {

      this.closeTimer = later(() => {

        this.closeTimer = null;

        dropdown.actions.close();

      }, 200);

    }
  },

});
