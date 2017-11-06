import Ember from 'ember';
import ModalBase from 'shared/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),

});
