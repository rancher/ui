import NewOrEdit from 'ui/mixins/new-or-edit';
import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend(NewOrEdit, {
  classNames         : ['lacsso', 'modal-container', 'span-6', 'offset-3', 'modal-logs'],
  originalModel      : Ember.computed.alias('modalService.modalOpts'),
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
