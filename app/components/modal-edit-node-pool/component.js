import { set, get } from '@ember/object';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames:    ['large-modal'],
  model:         null,

  originalModel:      alias('modalService.modalOpts'),
  init() {
    this._super(...arguments);

    set(this, 'model', get(this, 'originalModel').clone());
  },

  actions: {
    save() {
      set(this, 'modalService.modalOpts.nodeTaints', get(this, 'model.nodeTaints') || []);
      this.send('cancel');
    }
  }
});
