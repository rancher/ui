import Ember from 'ember';
import NewServiceAlias from 'ui/mixins/new-service-alias';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewServiceAlias, {
  classNames: ['large-modal'],
  originalModel  : Ember.computed.alias('modalService.modalOpts'),
  editing: true,
  existing: Ember.computed.alias('originalModel'),


  actions: {
    done() {
      this.send('cancel');
    },
  },

  init() {
    this._super(...arguments);
    this.set('service', this.get('originalModel').clone());
  },

  doneSaving() {
    this.send('cancel');
  },
});
