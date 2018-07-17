import $ from 'jquery';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  modalService:      service('modal'),
  layout,
  tagName:           'div',
  classNames:        ['modal-overlay'],
  classNameBindings: ['modalVisible:modal-open:modal-closed'],
  modalType:         alias('modalService.modalType'),
  modalVisible:      alias('modalService.modalVisible'),
  click(e) {
    if (this.get('modalService.closeWithOutsideClick') && $(e.target).hasClass('modal-open')) {
      this.get('modalService').toggleModal();
    }
  }
});
