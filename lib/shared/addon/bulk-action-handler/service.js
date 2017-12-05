import Service, { inject as service } from '@ember/service';

export default Service.extend({
  modalService: service('modal'),
  promptStop: function(nodes) {
    this.get('modalService').toggleModal('modal-container-stop', {
      model: nodes
    });
  },

  promptEvacuate: function(nodes) {
    this.get('modalService').toggleModal('modal-host-evacuate', {
      model: nodes
    });
  },

  promptDelete: function(nodes) {
    this.get('modalService').toggleModal('confirm-delete', {resources: nodes});
  },

  move: function(nodes) {
    this.get('modalService').toggleModal('modal-move-namespace', nodes);
  },
});
