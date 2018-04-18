import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed , get } from '@ember/object';

export default Controller.extend({
  scope: service(),
  queryParams: {
    groupedBy: 'group',
  },
  groupedBy: 'project',

  actions: {
    changeView() {

    },
  },

  projectsWithNamespaces: computed('rows.@each.{id,state,clusterId}', 'rows.@each.namespaces', function(){
    return get(this, 'rows').filter(p => get(p, 'namespaces.length') > 0);
  }),

  projectsWithoutNamespaces: computed('rows.@each.{id,state,clusterId}', 'rows.@each.namespaces', function(){
    return get(this, 'rows').filter(p => get(p, 'namespaces.length') <= 0);
  }),

  rows: computed('model.projects.@each.clusterId', function() {
    return get(this,'model.projects').filterBy('clusterId', get(this,'scope.currentCluster.id'));
  }),
  namespaceRows: computed('model.namespaces.@each.{id,state}', function() {
    return get(this, 'model.namespaces').filterBy('displayName');
  }),
});
