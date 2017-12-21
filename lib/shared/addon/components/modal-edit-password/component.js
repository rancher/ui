import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get/* , set */ } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal'],
  router: service(),
  actions: {
    complete(success) {
      if (success) {
        get(this, 'router').replaceWith('authenticated');
      }
    },
    cancel() {
      this.get('modalService').toggleModal();
    },

    goBack() {
      this.get('modalService').toggleModal();
    },

  },
});
