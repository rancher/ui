import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal'],
  name: alias('modalOpts.user.name'),
  password: null,
  confirm: null,
  canSave: equal('password', 'confirm'),
  globalStore: service(),
  router: service(),
  actions: {
    save(cb) {
      let user = get(this, 'modalOpts.user');
      user.password = get(this, 'password');
      get(this, 'globalStore').rawRequest({
        url: 'users/admin?action=changepassword', // TODO 2.0
        method: 'PUT',
        data: get(this, 'modalOpts.user')
      }).then((resp) => {
        cb(true);
        get(this, 'router').replaceWith('authenticated');
        // this.send('cancel');
      }).catch((/* res */) => {
        // let err;
        // try {
        //   err = res.body;
        // } catch(e) {
        //   err = {type: 'error', message: 'Error logging in'};
        // }
        return cb(false);
      });
    },
    cancel() {
      this.get('modalService').toggleModal();
    },

    goBack() {
      this.get('modalService').toggleModal();
    },

  },
});
