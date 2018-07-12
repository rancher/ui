import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { set, get } from '@ember/object';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal', 'alert'],
  branch:     '',
  sortBy:     'name',
  errors:     [],
  editing:    false,
  modalOpts:  alias('modalService.modalOpts'),
  actions:    {
    save(success) {

      let branch = get(this, 'branch');

      if (!branch){

        set(this, 'errors', ['Branch is required']);

        return

      }
      get(this, 'modalOpts').cb({ branch });
      success(true);
      this.send('cancel');

    }
  },
  doneSaving() {

    this.send('cancel');

  },
});
