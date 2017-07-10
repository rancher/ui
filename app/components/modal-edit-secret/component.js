import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['span-8', 'offset-2'],

  originalModel: Ember.computed.alias('modalService.modalOpts'),
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
