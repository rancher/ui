import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames:       ['medium-modal'],
  btnCB:            alias('modalService.modalOpts.btnCB'),
  isK3sCluster:      alias('modalService.modalOpts.isK3sCluster'),

  actions: {
    confirm() {
      const { btnCB } = this;

      this.modalService.modalOpts.finish(this.close.bind(this), false, btnCB);
    },
    cancel() {
      const { btnCB } = this;

      this.modalService.modalOpts.finish(this.close.bind(this), true, btnCB);
    },
  },

  close() {
    this.send('close');
  }
});
