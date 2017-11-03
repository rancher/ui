import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  requestObject  : Ember.computed.alias('modalService.modalOpts.requestObject'),
  responseObject  : Ember.computed.alias('modalService.modalOpts.responseObject'),
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
