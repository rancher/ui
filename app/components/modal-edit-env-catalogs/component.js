import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  project: Ember.computed.alias('modalService.modalOpts.project'),
  catalogs: Ember.computed.alias('modalService.modalOpts.catalogs'),
});
