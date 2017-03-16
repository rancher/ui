import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

// Dont forget to launch your modal from the route/controller/component with the following command.
// this.get('modalService').toggleModal('modal-<%= dasherizedModuleName %>', {
// add your modal options here
// });


export default Ember.Component.extend(ModalBase, {
  classNames: ['<%= size %>'],
});
