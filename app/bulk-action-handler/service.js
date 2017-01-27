import Ember from 'ember';

export default Ember.Service.extend({
  modalService: Ember.inject.service('modal'),
  promptStop: function(nodes) {
    this.get('modalService').toggleModal('modal-container-stop', {
      model: nodes
    });
  },
  stop: function(nodes) {
    nodes.forEach((node) => {
      node.send('stop');
    });
  },
  start: function(nodes) {
    nodes.forEach((node) => {
      node.send('start');
    });
  },
  restart: function(nodes) {
    nodes.forEach((node) => {
      node.send('restart');
    });
  },
  promptDelete: function(nodes) {
    this.get('modalService').toggleModal('confirm-delete', nodes);
  },
  delete: function(nodes) {
    nodes.forEach((node) => {
      node.send('delete');
    });
  },
});
