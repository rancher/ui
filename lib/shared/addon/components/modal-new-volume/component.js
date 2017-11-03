import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],

  callback: Ember.computed.alias('modalService.modalOpts.callback'),
  model: Ember.computed.alias('modalService.modalOpts.model'),
  editing: true,

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
