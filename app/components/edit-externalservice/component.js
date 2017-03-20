import NewOrEdit from 'ui/mixins/new-or-edit';
import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  existing: Ember.computed.alias('originalModel'),
  editing: true,

  service: null,
  primaryResource: Ember.computed.alias('service'),

  actions: {
    done() {
      this.send('cancel');
    },
  },

  init() {
    this._super(...arguments);
    var original = this.get('originalModel');
    this.set('service', original.clone());
  },

  doneSaving: function() {
    this.send('cancel');
  },

  didInsertElement() {
    this.$('INPUT')[0].focus();
  },
});
