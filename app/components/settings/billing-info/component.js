import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  modalService: service('modal'),
  layout,
  classNames:   ['billing-info', 'box'],
  cards:        null,
  account:      null,
  actions:      {
    addNew() {
      this.get('modalService').toggleModal('modal-add-payment', this.get('account'));
    },
    remove(card) {
      this.get('modalService').toggleModal('modal-confirm-remove-payment', {
        card,
        account: this.get('account')
      });
    }
  }
});
