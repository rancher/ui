import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

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
      let branch = this.get('branch');
      if(!branch){
        this.set('errors', ['Branch is required']);
        return 
      }
      this.get('modalOpts').cb({
        branch
      });
      success(true);
      this.send('cancel');
    }
  }
});
