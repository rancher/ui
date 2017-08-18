import Ember from 'ember';

export default Ember.Controller.extend({
  clusterController: Ember.inject.controller('authenticated.clusters.cluster'),
  cluster: Ember.computed.alias('clusterController.model'),

  queryParams : ['backTo', 'driver', 'hostId'],
  backTo      : null,
  driver      : null,
  hostId      : null,
  actions: {
    completed() {}
  }
});
