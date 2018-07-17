import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  modalType:             'generic-modal',
  modalOpts:             null,
  modalVisible:          false,
  lastScroll:            null,
  closeWithOutsideClick: alias('modalOpts.closeWithOutsideClick'),
  app:                   service(),
  toggleModal(type = null, opts = null) {
    if (opts) {
      this.set('modalOpts', opts);
    }

    this.set('modalType', type);

    if ( this.get('modalVisible') ) {
      this.set('modalVisible', false);
      this.set('modalOpts', null);
      next(() => {
        window.scrollTo(0, this.get('lastScroll'));
      });
    } else {
      this.set('lastScroll', window.scrollY);
      this.set('modalVisible', true);
      next(() => {
        window.scrollTo(0, 0);
      });
    }
  },
});
