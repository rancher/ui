import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  editing: true,
  model: null,

  willInsertElement: function() {
    this._super(...arguments);
    var orig = this.get('originalModel');
    var clone = orig.clone();
    this.set('model', clone);
    this.set('editing', !!this.get('model.id'));
  },

  doneSaving: function() {
    this.send('cancel');
  }
});
