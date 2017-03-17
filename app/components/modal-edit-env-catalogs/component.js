import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

// Dont forget to launch your modal from the route/controller/component with the following command.
// this.get('modalService').toggleModal('modal-edit-env-catalogs', {
// add your modal options here
// });


export default Ember.Component.extend(ModalBase, {
  classNames: ['large-modal'],
  project: Ember.computed.alias('modalService.modalOpts.project'),
  catalogs: Ember.computed.alias('modalService.modalOpts.catalogs'),
});
