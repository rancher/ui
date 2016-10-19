import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'large-modal'],
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
