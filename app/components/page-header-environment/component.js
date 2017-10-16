import Ember from 'ember';

export default Ember.Component.extend({
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  project: Ember.computed.alias('projects.current'),

  isOwner: null,

  tagName: 'LI',
  classNames: ['dropdown','nav-item','nav-cluster'],
  classNameBindings: ['hide'],

  actions: {
    switchProject(id) {
      this.sendAction('switchProject', id);
    },

    switchNamespace(id) {
      this.sendAction('switchNamespace', id);
    },
  },

  twoLine: Ember.computed('scope', function() {
    return this.get('scope') === 'project';
  }),

  hide: Ember.computed('scope',function() {
    return this.get('scope') === 'user';
  }),

  isAdmin: Ember.computed.reads('access.admin'),

  clusters: Ember.computed(function() {
    return this.get('userStore').all('cluster', null, {url: 'clusters', forceReload: true, removeMissing: true});
  }),

  projectChoices: Ember.computed('projects.active.@each.{id,displayName,state}', 'clusters.@each.{state,transition}', function() {
    return this.get('projects.active').filter((project) => {
      let removedish = ['removing', 'removed'];
      let cluster = this.get('clusters').findBy('id', project.get('clusterId'));
      if ( cluster && !removedish.includes( cluster.get('state'))) {
        return project;
      }
    }).sortBy('name','id');
  }),

  byCluster: Ember.computed('projectChoices.@each.clusterId', function() {
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
  }),

  projectIsMissing: Ember.computed('project.id','projectChoices.@each.id', function() {
    return this.get('projectChoices').filterBy('id', this.get('project.id')).get('length') === 0;
  }),
});
