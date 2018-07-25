import Controller from '@ember/controller';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  modal:       service(),

  newPassword: null,

  actions: {
    done() {
      window.history.back();
      // this.send('goToPrevious');
    },

    editPassword() {
      get(this, 'modal').toggleModal('modal-edit-password', { user: get(this, 'model.account') });
    },
  },
});
