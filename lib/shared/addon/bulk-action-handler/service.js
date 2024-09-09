import Service, { inject as service } from '@ember/service';

export default Service.extend({
  modalService: service('modal'),
  app:          service(),
  promptStop(nodes) {
    this.get('modalService').toggleModal('modal-container-stop', {
      escToClose: true,
      model:      nodes
    });
  },

  promptDelete(nodes) {
    this.get('modalService').toggleModal('confirm-delete', {
      escToClose: true,
      resources:  nodes
    });
  },

  drain(nodes) {
    this.get('modalService').toggleModal('modal-drain-node', {
      escToClose: true,
      resources:  nodes
    });
  },

  move(nodes) {
    this.get('modalService').toggleModal('modal-move-namespace', nodes);
  },
});
