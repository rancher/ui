import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'full-width-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),

});
