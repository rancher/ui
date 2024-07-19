import { get } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  modalService: service('modal'),
  globalStore:  service(),
  scope:        service(),

  queryParams: ['type'],
  currentType: 'slack',

  notifiers: alias('model.notifiers'),
  actions:   {
    showNewEditModal() {
      this.modalService.toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        controller:            this,
        currentType:           this.currentType,
        mode:                  'add',
      });
    },
  },
});
