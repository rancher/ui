import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { set, get } from '@ember/object';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal', 'alert'],
  modalOpts: alias('modalService.modalOpts'),
  branch: '',
  sortBy: 'name',
  errors: [],
  editing: false,
  doneSaving() {
    this.send('cancel');
  },
  actions: {
    save: function(success) {
      let branch = get(this, 'branch');
      if(!branch){
        set(this, 'errors', ['Branch is required']);
        return 
      }
      get(this, 'modalOpts').cb({
        branch
      });
      success(true);
      this.send('cancel');
    }
  }
});
