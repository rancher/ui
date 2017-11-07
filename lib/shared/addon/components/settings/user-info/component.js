import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  access:       service(),
  modalService: service('modal'),
  account:      null,

  actions: {
    editPassword() {
      this.get('account').send('edit');
    }
  }

});
