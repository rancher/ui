import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'large-modal', 'modal-shell'],
  originalModel: Ember.computed.alias('modalService.modalOpts.model'),
  init() {
    this._super(...arguments);
    this.shortcuts.disable();
  },
  willDestroy() {
    this._super(...arguments);
    this.shortcuts.enable();
  }

});
