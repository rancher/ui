import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal'],

  editing: true,

  callback: alias('modalService.modalOpts.callback'),
  model:    alias('modalService.modalOpts.model'),
  init() {
    this._super(...arguments);
    if ( !this.get('model') ) {
      this.set('model', {});
    }
  },

  actions: {
    doSave() {
      let callback = this.get('callback');

      if ( callback ) {
        callback(this.get('model'));
      }

      this.send('cancel');
    }
  }
});
