import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend(NewOrEdit, {
  classNames: ['lacsso', 'modal-container', 'span-6', 'offset-3'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  editing: true,
  model: null,


  init: function() {
    this._super(...arguments);
    var orig = this.get('originalModel');
    var clone = orig.clone();
    delete clone.services;
    this.set('model', clone);
  },

  doneSaving: function() {
    this.send('cancel');
  }
});
