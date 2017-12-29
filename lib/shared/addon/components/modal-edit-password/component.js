import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get/* , set */ } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal'],
  router: service(),
  showHelp: false,
  actions: {
    complete(success) {
      if (success) {
        // get(this, 'router').replaceWith('authenticated');
        get(this, 'modalService').toggleModal();
      }
    },
    cancel() {
      get(this, 'modalService').toggleModal();
    },

    goBack() {
      get(this, 'modalService').toggleModal();
    },

  },
});
