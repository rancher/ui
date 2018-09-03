import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames:    ['modal-container', 'large-modal', 'fullscreen-modal', 'modal-shell', 'alert'],
  originalModel: alias('modalService.modalOpts.model'),
  containerName: alias('modalService.modalOpts.containerName'),
  init() {
    this._super(...arguments);
    this.shortcuts.disable();
  },
  willDestroy() {
    this._super(...arguments);
    this.shortcuts.enable();
  }

});
