import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames:    ['large-modal', 'fullscreen-modal', 'alert'],
  originalModel: alias('modalService.modalOpts.model'),
  containerName: alias('modalService.modalOpts.containerName'),
});
