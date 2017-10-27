import Ember from 'ember';

export default Ember.Service.extend({
  modalService: Ember.inject.service('modal'),
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
});
