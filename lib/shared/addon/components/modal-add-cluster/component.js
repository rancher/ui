import ModalBase from 'ui/mixins/modal-base';
import layout from './template';

// Dont forget to launch your modal from the route/controller/component with the following command.
// this.get('modalService').toggleModal('modal-add-cluster', {
// add your modal options here
// });


export default ModalBase.extend({
  layout,
  classNames: ['small-modal'],
});
