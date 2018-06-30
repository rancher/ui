import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  modal:       service(),

  newPassword: null,
  isCaas:      equal('app.mode', C.MODE.CAAS),
  actions:     {
    done() {

      window.history.back();
      // this.send('goToPrevious');

    },
    editPassword() {

      get(this, 'modal').toggleModal('modal-edit-password', { user: get(this, 'model.account') });

    },
  },
});
