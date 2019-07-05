import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import { alias, union } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  scope:           service(),
  modalService:    service('modal'),
  router:          service(),
  queryParams:     ['istio'],
  istio:           false,
  globalCatalogs:  alias('model.globalCatalogs'),
  filtered:        union('globalCatalogs', 'clusterCatalogs', 'projectCatalogs'),

  actions: {
    add() {
      const record = get(this, 'globalStore').createRecord({
        type:      'projectcatalog',
        kind:      'helm',
        branch:    'master',
        projectId: get(this, 'scope.currentProject.id'),
      });

      get(this, 'modalService').toggleModal('modal-edit-catalog', {
        model: record,
        scope: 'project'
      });
    },

    goBack() {
      if ( get(this, 'istio') ) {
        get(this, 'router').transitionTo('authenticated.project.istio.project-istio.rules');
      } else {
        get(this, 'router').transitionTo('apps-tab');
      }
    }
  },

  clusterCatalogs: computed('model.clusterCatalogs.@each.{clusterId,state,id}', function() {
    return get(this, 'model.clusterCatalogs').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
  }),

  projectCatalogs: computed('model.projectCatalogs.@each.{clusterId,state,id}', function() {
    return get(this, 'model.projectCatalogs').filterBy('projectId', get(this, 'scope.currentProject.id'));
  }),
});
