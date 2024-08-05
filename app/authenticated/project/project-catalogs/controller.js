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
      const record = this.globalStore.createRecord({
        type:      'projectcatalog',
        kind:      'helm',
        branch:    'master',
        projectId: get(this, 'scope.currentProject.id'),
      });

      this.modalService.toggleModal('modal-edit-catalog', {
        model: record,
        scope: 'project'
      });
    },

    goBack() {
      if ( this.istio ) {
        this.router.transitionTo('authenticated.project.istio.project-istio.rules');
      } else {
        this.router.transitionTo('apps-tab');
      }
    }
  },

  clusterCatalogs: computed('model.clusterCatalogs.@each.{clusterId,id,state}', 'scope.currentCluster.id', function() {
    return get(this, 'model.clusterCatalogs').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
  }),

  projectCatalogs: computed('model.projectCatalogs.@each.{clusterId,id,state}', 'scope.currentProject.id', function() {
    return get(this, 'model.projectCatalogs').filterBy('projectId', get(this, 'scope.currentProject.id'));
  }),
});
