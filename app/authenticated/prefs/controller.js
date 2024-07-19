import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  modal: service(),

  newPassword: null,

  actions: {
    editPassword() {
      this.modal.toggleModal('modal-edit-password', { user: get(this, 'model.account') });
    },
  },
});
