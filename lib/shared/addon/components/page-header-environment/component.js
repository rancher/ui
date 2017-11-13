import { alias, reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  access:            service(),
  scope:          service(),
  project:           alias('scope.current'),

  isOwner:           null,

  tagName:           'LI',
  classNames:        ['dropdown','nav-item','nav-cluster'],
  classNameBindings: ['hide'],

  actions: {
    switchProject(id) {
      this.sendAction('switchProject', id);
    },

    switchNamespace(id) {
      this.sendAction('switchNamespace', id);
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
    return this.get('userStore').all('cluster', null, {url: 'clusters', forceReload: true, removeMissing: true});
  }),

  projectChoices: computed('scope.active.@each.{id,displayName,state}', 'clusters.@each.{state,transition}', function() {
    return this.get('scope.active').filter((project) => {
      let removedish = ['removing', 'removed'];
      let cluster = this.get('clusters').findBy('id', project.get('clusterId'));
      if ( cluster && !removedish.includes( cluster.get('state'))) {
        return project;
      }
    }).sortBy('name','id');
  }),

  byCluster: computed('projectChoices.@each.clusterId','scope.current.id','scope.currentCluster.id', function() {
    let currentClusterId = this.get('scope.currentCluster.id');

    let out = [];
    this.get('projectChoices').forEach((project) => {
      let cluster = project.get('cluster');
      if ( !cluster ) {
        return;
      }

      let clusterId = cluster.get('id');
      let entry = out.findBy('clusterId', clusterId);
      if ( !entry ) {
        entry = {
          clusterId: clusterId,
          cluster: cluster,
          projects: [],
          active: clusterId === currentClusterId,
          show: false
        };

        out.push(entry);
      }

      entry.projects.push(project);
      entry.show = true;
    });

    return out.filterBy('show',true).sortBy('cluster.sortName');
  }),

  projectIsMissing: computed('project.id','projectChoices.@each.id', function() {
    return this.get('projectChoices').filterBy('id', this.get('project.id')).get('length') === 0;
  }),
});
