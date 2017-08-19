import Ember from 'ember';

export default Ember.Component.extend({
  currentPath : null,
  isOwner     : null,

  tagName     : '',

  projects    : Ember.inject.service(),
  project     : Ember.computed.alias('projects.current'),

  projectChoices: function() {
    return this.get('projects.active').sortBy('name','id');
  }.property('projects.active.@each.{id,displayName,state}'),

  byCluster: function() {
    let out = [];
    this.get('projectChoices').forEach((project) => {
      let cluster = project.get('cluster');
      if ( !cluster ) {
        return;
      }

      let clusterId = cluster.get('id');
      let entry = out.findBy('clusterId', clusterId);
      if ( !entry ) {
        entry = {clusterId: clusterId, cluster: cluster, projects: [], show: false};
        out.push(entry);
      }

      if ( project.get('clusterOwner') ) {
        entry.system = project;
      } else {
        entry.projects.push(project);
        entry.show = true;
      }
    });

    return out.filterBy('show',true);
  }.property('projectChoices.@each.clusterId'),

  projectIsMissing: function() {
    return this.get('projectChoices').filterBy('id', this.get('project.id')).get('length') === 0;
  }.property('project.id','projectChoices.@each.id'),

  actions: {
    switchProject(id) {
      this.sendAction('switchProject', id);
    },

    switchNamespace(id) {
      this.sendAction('switchNamespace', id);
    },
  }
});
