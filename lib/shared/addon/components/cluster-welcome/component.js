import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  cluster: Ember.computed.alias('projects.currentCluster'),
  canCreate: Ember.computed.notEmpty('cluster.registrationToken.hostCommand'),
  canImport: Ember.computed.notEmpty('cluster.registrationToken.clusterCommand'),

  header: true,
});
