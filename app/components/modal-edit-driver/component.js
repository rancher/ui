import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend(NewOrEdit, {
  classNames: ['lacsso', 'modal-container', 'span-6', 'offset-3'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  settings: Ember.inject.service(),

  clone           : null,
  primaryResource : Ember.computed.alias('originalModel'),
  errors          : null,

  init() {
    this._super(...arguments);
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
  },

  editing: function() {
    return !!this.get('clone.id');
  }.property('clone.id'),

  didRender() {
    setTimeout(() => {
      if (this._state === 'inDOM') {
        this.$('INPUT')[0].focus();
      }
    }, 500);
  },

  doneSaving() {
    this.send('cancel');
  }
});
