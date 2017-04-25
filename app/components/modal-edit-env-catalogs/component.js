import Ember from 'ember';
import ModalBase from 'lacsso/components/modal-base';

export default ModalBase.extend({
  classNames: ['lacsso', 'modal-container', 'large-modal'],
  project: Ember.computed.alias('modalService.modalOpts.project'),
  catalogs: Ember.computed.alias('modalService.modalOpts.catalogs'),
});
