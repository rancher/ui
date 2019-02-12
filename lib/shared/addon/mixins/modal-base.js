import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import C from 'ui/utils/constants';

export default Mixin.create({
  classNames: ['modal-container'],

  modalService: service('modal'),
  modalOpts:    alias('modalService.modalOpts'),

  keyUp(e) {
    if (e.which === C.KEY.ESCAPE && this.escToClose()) {
      this.get('modalService').toggleModal();
    }
  },

  escToClose() {
    var modalService = this.get('modalService');

    if (modalService.get('modalVisible') && modalService.get('modalOpts.escToClose')) {
      return true;
    } else {
      return false;
    }
  },

  actions: {
    close() {
      this.get('modalService').toggleModal();
    },

    cancel() {
      this.get('modalService').toggleModal();
    },
  },
});
