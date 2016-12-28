import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';
import NewServiceAlias from 'ui/mixins/new-service-alias';

export default ModalBase.extend(NewServiceAlias, {
  classNames: ['lacsso', 'modal-container', 'large-modal'],
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
