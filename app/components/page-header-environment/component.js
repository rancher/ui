import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object';

export default Component.extend({
  access:            service(),
  scope:             service(),
  globalStore:       service(),

  layout,
  pageScope:         null,

  tagName:           'LI',
  classNames:        ['dropdown', 'nav-item', 'nav-cluster'],
  classNameBindings: ['hide'],

  project:           alias('scope.pendingProject'),
  cluster:           alias('scope.pendingCluster'),
  twoLine: computed('pageScope', function() {

    return this.get('pageScope') === 'project';

  }),

  hide: computed('pageScope', function() {

    return this.get('pageScope') === 'user';

  }),

  projectChoices: computed('scope.allProjects.@each.{id,displayName,relevantState}', function() {

    return this.get('scope.allProjects').filterBy('relevantState', 'active')
      .sortBy('displayName', 'id');

  }),

  byCluster: computed('scope.allClusters.@each.id', 'projectChoices.@each.clusterId', 'cluster.id', function() {

    const currentClusterId = this.get('cluster.id');
    const out = [];

    this.get('scope.allClusters').forEach((cluster) => {

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
          clusterId,
          cluster,
          projects:  [],
          active:    clusterId === currentClusterId,
        };

        out.push(entry);

      }

      return entry;

    }

  }),

  projectIsMissing: computed('project.id', 'projectChoices.@each.id', () => false
    // const projectId = this.get('project.id');
    // return projectId && this.get('projectChoices').filterBy('id', projectId).get('length') === 0;
  ),
});
