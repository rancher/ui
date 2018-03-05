import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, NewOrEdit, {
  layout,
  classNames: ['large-modal', 'alert'],
  modalOpts: alias('modalService.modalOpts'),
  model: null,
  clone: null,
  primaryResource: alias('originalModel'),
  sortBy: 'name',
  errors: [],
  init() {
    this._super(...arguments);
    var opts = this.get('modalOpts');
    if (opts.mode === "edit" || opts.mode === 'review') {
      this.set('model', opts.stage);
      this.set('editing', true);
    } else {
      this.set('model', {
        id: null,
        name: null,
        steps: []
      })
    }
  },
  editing: false,
  doneSaving() {
    this.send('cancel');
  },
  actions: {
    add: function(success) {
      var model = this.get('model');
      if(!model.name){
        this.set('errors',['"Name" is required!']);
        return success(false);
      }
      this.set('model.id', Date.now());
      var added = this.get('modalOpts').cb(model);
      if(!added){
        this.set('errors',['The same stage name is not allowed!']);
        return success(false);
      }
      success(true);
      this.send('cancel');
    },
    remove: function() {
      this.get('modalOpts').rmCb();
      this.send('cancel');
    }
  }
});
