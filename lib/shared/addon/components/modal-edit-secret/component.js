import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['span-8', 'offset-2'],

  originalModel: alias('modalService.modalOpts'),
  editing: true,
  model: null,

  init() {
    this._super(...arguments);
    this.set('model', this.get('originalModel').clone());
  },

  doneSaving() {
    this.send('cancel');
  },
});
