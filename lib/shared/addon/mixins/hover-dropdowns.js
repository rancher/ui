import Mixin from '@ember/object/mixin';
import { next, cancel, later } from '@ember/runloop';
import { get, set } from '@ember/object';

export default Mixin.create({
  closeTimer: null,

  actions: {
    prevent() {
      return false;
    },

    open(dropdown) {
      const ct = get(this, 'closeTimer');

      console.log('open closeTimer: ', this.closeTimer, get(dropdown, 'uniqueId'));
      if (ct) {

        cancel(ct);
        set(this, 'closeTimer', null);


      } else {

        dropdown.actions.open();

      }
    },

    closeLater(dropdown) {

      set(this, 'closeTimer', later(() => {

        dropdown.actions.close();
        set(this, 'closeTimer', null);

      }, 200));
      console.log('close closeTimer: ', this.closeTimer, get(dropdown, 'uniqueId'));

    }

  },

});
