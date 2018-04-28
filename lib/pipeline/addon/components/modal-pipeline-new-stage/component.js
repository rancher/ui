import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'shared/mixins/new-or-edit';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { set, get } from '@ember/object';

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
    var opts = get(this, 'modalOpts');
    if (opts.mode === "edit" || opts.mode === 'review') {
      set(this, 'model', opts.stage);
      set(this, 'editing', true);
    } else {
      set(this, 'model', {
        id: null,
        name: null,
        steps: []
      })
    }
  },
  didInsertElement(){
    let $input = this.$('.js-autofocus');
    $input.focus();
  },
  editing: false,
  doneSaving() {
    this.send('cancel');
  },
  actions: {
    add: function(success) {
      var model = get(this, 'model');
      if(!model.name){
        set(this, 'errors',['"Name" is required!']);
        return success(false);
      }
      set(this, 'model.id', Date.now());
      var added = get(this, 'modalOpts').cb(model);
      if(!added){
        set(this, 'errors',['The same stage name is not allowed!']);
        return success(false);
      }
      success(true);
      this.send('cancel');
    },
    remove: function() {
      get(this, 'modalOpts').rmCb();
      this.send('cancel');
    }
  }
});
