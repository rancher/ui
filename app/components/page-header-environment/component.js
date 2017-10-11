import Ember from 'ember';

export default Ember.Component.extend({
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  project: Ember.computed.alias('projects.current'),

  currentPath: null,
  isOwner: null,

  tagName: '',

  isAdmin: Ember.computed.reads('access.admin'),

  clusters: Ember.computed(function() {
    return this.get('userStore').all('cluster', null, {url: 'clusters', forceReload: true, removeMissing: true});
  }),

  projectChoices: function() {
    return this.get('projects.active').filter((project) => {
      let removedish = ['removing', 'removed'];
      let cluster = this.get('clusters').findBy('id', project.get('clusterId'));
      if ( cluster && !removedish.includes( cluster.get('state'))) {
        return project;
      }
    }).sortBy('name','id');
  }.property('projects.active.@each.{id,displayName,state}', 'clusters.@each.{state,transition}'),

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

      entry.projects.push(project);
      entry.show = true;
    });

    return out.filterBy('show',true);
  }.property('projectChoices.@each.clusterId'),

  nested: Ember.computed.gt('byCluster.length', 1),

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
