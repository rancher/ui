import Ember from 'ember';

export default Ember.Controller.extend({
  clusterController: Ember.inject.controller('authenticated.clusters.cluster'),
  cluster: Ember.computed.alias('clusterController.model'),

  loading: Ember.computed.alias('cluster.isTransitioning'),
  registrationCommand: Ember.computed.alias('cluster.registrationToken.clusterCommand'),

  actions: {
    save() {
    },

    cancel() {
      this.transitionToRoute('authenticated.clusters');
    }
  },

  configSet: function() {
    return (this.get('kubeconfig')||'').includes('clusters:');
  }.property('kubeconfig'),
});
