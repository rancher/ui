import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed , get } from '@ember/object';

export default Controller.extend({
  scope: service(),
  queryParams: {
    group: 'group',
  },
  group: 'project',

  actions: {
    changeView() {

    },
  },

  rows: computed('model.namespaces.@each.displayName', 'scope.currentCluster.id', function() {
    return get(this, 'model.namespaces')
      .filterBy('displayName');
  }),

  projects: computed('model.projects.@each.clusterId', 'scope.currentCluster.id', function() {
    return get(this,'model.projects').filterBy('clusterId', get(this,'scope.currentCluster.id'));
  }),

  projectsWithoutNamespaces: computed('projects.@each.{id,state,clusterId}', 'rows.@each.namespaces', function(){
    return get(this, 'projects').filter(p => get(p, 'namespaces.length') <= 0);
  }),

});
