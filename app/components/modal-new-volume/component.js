import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  model: Ember.computed.alias('modalService.modalOpts'),
  editing: true,

  init() {
    if ( !this.get('model') ) {
      this.set('model', {});
    }
  },

  actions: {
    doSave() {
      this.sendAction('doSave', this.get('model'));
    }
  }
});
