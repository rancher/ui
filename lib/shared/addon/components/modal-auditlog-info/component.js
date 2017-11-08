import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal'],
  requestObject  : alias('modalService.modalOpts.requestObject'),
  responseObject  : alias('modalService.modalOpts.responseObject'),
  requestJSON    : null,
  responseJSON   : null,

  init() {
    this._super(...arguments);

    // Pretty-ify the JSON
    this.set('requestJSON', JSON.stringify(JSON.parse(this.get('requestObject')),null,2));
    this.set('responseJSON', JSON.stringify(JSON.parse(this.get('responseObject')),null,2));
  },

  actions: {
    dismiss: function() {
      this.send('cancel');
    }
  },
});
