import { get } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  modalService: service('modal'),
  globalStore:  service(),

  queryParams: ['type'],
  currentType: 'slack',

  notifiers: alias('model.notifiers'),
  actions:   {
    showNewEditModal() {
      get(this, 'modalService').toggleModal('notifier/modal-new-edit', {
        closeWithOutsideClick: false,
        controller:            this,
        currentType:           get(this, 'currentType'),
        mode:                  'add',
      });
    },
  },
});
