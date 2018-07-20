import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  access:       service(),
  modalService: service('modal'),
  layout,
  account:      null,

  actions: {
    editPassword() {
      this.get('account').send('edit');
    }
  }

});
