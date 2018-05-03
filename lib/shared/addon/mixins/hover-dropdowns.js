import Mixin from '@ember/object/mixin';
import { cancel, later } from '@ember/runloop';

export default Mixin.create({
  actions: {
    prevent() {
      return false;
    },

    open(dropdown) {
      if (this.closeTimer) {
        cancel(this.closeTimer);
        this.closeTimer = null;
      } else {
        dropdown.actions.open();
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
