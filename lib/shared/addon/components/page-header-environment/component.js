import { alias, reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  access:            service(),
  projects:          service('scope'),
  project:           alias('projects.current'),
  cluster:           alias('projects.currentCluster'),
  globalStore:       service(),

  isOwner:           null,

  tagName:           'LI',
  classNames:        ['dropdown','nav-item','nav-cluster'],
  classNameBindings: ['hide'],

  actions: {
    switchCluster(cluster) {
      this.get('projects').setCurrentCluster(cluster).then(() => {
        this.sendAction('switchCluster', cluster.id, 'authenticated.cluster', [cluster.id]);
      });
    },
  },

  twoLine: computed('scope', function() {
    return this.get('scope') === 'project';
  }),

  hide: computed('scope',function() {
    return this.get('scope') === 'user';
  }),

  isAdmin: reads('access.admin'),

  clusters: computed(function() {
    return this.get('globalStore').all('cluster');
  }),

  projectChoices: computed('projects.active.@each.{id,displayName,state}', 'clusters.@each.{state,transition}', function() {
    return this.get('projects.active').filter((project) => {
      let removedish = ['removing', 'removed'];
      let cluster = this.get('clusters').findBy('id', project.get('clusterId'));
      if ( cluster && !removedish.includes( cluster.get('state'))) {
        return project;
      }
    }).sortBy('name','id');
  }),

  byCluster: computed('clusters.@each.id', 'projectChoices.@each.clusterId','projects.current.id','projects.currentCluster.id', function() {
    const currentClusterId = this.get('projects.currentCluster.id');
    const out = [];

    this.get('clusters').forEach((cluster) => {
      getOrAddCluster(cluster);
    });

    this.get('projectChoices').forEach((project) => {
      let cluster = project.get('cluster');
      if ( !cluster ) {
        return;
      }

      let entry = getOrAddCluster(cluster);
      entry.projects.push(project);
    });

    return out.sortBy('cluster.sortName');

    function getOrAddCluster(cluster) {
      let clusterId = cluster.get('id');
      let entry = out.findBy('clusterId', clusterId);
      if ( !entry ) {
        entry = {
          clusterId: clusterId,
          cluster: cluster,
          projects: [],
          active: clusterId === currentClusterId,
        };

        out.push(entry);
      }

      return entry;
    }
  }),

  projectIsMissing: computed('project.id','projectChoices.@each.id', function() {
    const projectId = this.get('project.id');
    return projectId && this.get('projectChoices').filterBy('id', projectId).get('length') === 0;
  }),
});
