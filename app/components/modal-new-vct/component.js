import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames:      ['large-modal'],

  editing:         true,

  callback:        alias('modalService.modalOpts.callback'),
  namespace:       alias('modalService.modalOpts.namespace'),
  model:           alias('modalService.modalOpts.model'),

  init() {
    this._super(...arguments);

    if ( !get(this, 'model') ) {
      set(this, 'model', {});
    }
  },

  actions: {
    doSave() {
      let callback = get(this, 'callback');

      if ( callback ) {
        callback(get(this, 'model'));
      }

      this.send('cancel');
    }
  }
});
