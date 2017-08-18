import Ember from 'ember';

export default Ember.Controller.extend({
  modalService: Ember.inject.service('modal'),
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  application: Ember.inject.controller(),

  sortBy: ['name','id'],
  arrangedClusters: Ember.computed.sort('model.clusters','sortBy'),

  actions: {
    newCluster() {
      this.get('modalService').toggleModal('modal-edit-cluster');
    },
  },
});
