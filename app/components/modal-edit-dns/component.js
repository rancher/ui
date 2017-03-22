import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  originalModel  : Ember.computed.alias('modalService.modalOpts'),

  actions: {
    done() {
      this.send('cancel');
    },
  },

  init() {
    this._super(...arguments);
    this.set('record', this.get('originalModel').clone());
  },

  doneSaving() {
    this.send('cancel');
  },
});
