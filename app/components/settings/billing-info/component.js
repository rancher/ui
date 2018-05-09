import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  modalService: service('modal'),
  classNames: ['billing-info', 'box'],
  cards: null,
  account: null,
  actions: {
    addNew() {
      this.get('modalService').toggleModal('modal-add-payment', this.get('account'));
    },
    remove(card) {
      this.get('modalService').toggleModal('modal-confirm-remove-payment', {card: card, account: this.get('account')});
    }
  }
});
