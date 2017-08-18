import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  actions: {
    launch(model) {
      this.transitionToRoute('authenticated.clusters.cluster.host-templates.launch', this.get('projects.currentCluster.id'), model.id);
    },
  },

  sorting: ['driver','name'],
  arranged: Ember.computed.sort('model','sorting'),
});
