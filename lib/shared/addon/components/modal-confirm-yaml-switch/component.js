import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal'],
  model:      alias('modalService.modalOpts.propertiesGoingToBeLost'),

  actions: {
    confirm() {
      this.modalService.modalOpts.finish(this.close.bind(this));
    },
    cancel() {
      this.modalService.modalOpts.finish(this.close.bind(this), true);
    },
  },

  close() {
    this.send('close');
  }
});
