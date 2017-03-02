import Ember from 'ember';

export default Ember.Component.extend({
  modalService: Ember.inject.service('modal'),
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
