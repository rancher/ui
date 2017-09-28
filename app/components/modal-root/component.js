import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['modal-overlay'],
  classNameBindings: ['modalVisible:modal-open:modal-closed'],
  modalService: Ember.inject.service('modal'),
  modalType: Ember.computed.alias('modalService.modalType'),
  modalVisible: Ember.computed.alias('modalService.modalVisible'),
  click(e) {
    if (this.get('modalService.closeWithOutsideClick') && Ember.$(e.target).hasClass('modal-open')) {
      this.get('modalService').toggleModal();
    }
  }
});
