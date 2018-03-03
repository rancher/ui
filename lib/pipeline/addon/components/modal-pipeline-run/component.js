import Ember from 'ember';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Ember.Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal', 'alert'],
  modalOpts: Ember.computed.alias('modalService.modalOpts'),
  branch: '',
  // primaryResource: Ember.computed.alias('originalModel'),
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
      var added = this.get('modalOpts').cb({
        branch
      });
      success(true);
      this.send('cancel');
    }
  }
});
