import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  model  : Ember.computed.alias('modalService.modalOpts'),

  actions: {
    done() {
      this.send('cancel');
    },
  },

  doneSaving() {
    this.send('cancel');
  },
});
