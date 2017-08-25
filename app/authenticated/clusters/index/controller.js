import Ember from 'ember';
import { headersWithCluster } from 'ui/components/cluster-box/component';

export default Ember.Controller.extend({
  queryParams: ['mode'],
  mode: 'grouped',

  modalService: Ember.inject.service('modal'),
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  application: Ember.inject.controller(),

  headers: headersWithCluster,
  sortBy: 'cluster',
  searchText: null,

  sortClusters: ['name','id'],
  arrangedClusters: Ember.computed.sort('model.clusters','sortClusters'),

  actions: {
    newCluster() {
      this.get('modalService').toggleModal('modal-edit-cluster');
    },
  },
});
