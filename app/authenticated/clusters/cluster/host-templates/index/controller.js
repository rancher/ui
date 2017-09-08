import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),

  queryParams: ['backTo'],
  backTo: 'hosts',
  currentClusterId: null,

  actions: {
    launch(model) {
      this.transitionToRoute('authenticated.clusters.cluster.host-templates.launch', this.get('currentClusterId'), model.id);
    },
  },

  sorting: ['driver','name'],
  arranged: Ember.computed.sort('model','sorting'),
});
