import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import { alias, union } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  scope:          service(),
  modalService:   service('modal'),
  globalCatalogs: alias('model.globalCatalogs'),
  filtered:       union('globalCatalogs', 'clusterCatalogs'),

  actions: {
    add() {
      const record = this.globalStore.createRecord({
        type:      'clustercatalog',
        kind:      'helm',
        branch:    'master',
        clusterId: get(this, 'scope.currentCluster.id'),
      });

      this.modalService.toggleModal('modal-edit-catalog', {
        model: record,
        scope: 'cluster'
      });
    },
  },

  clusterCatalogs: computed('model.clusterCatalogs.@each.{clusterId,id,state}', 'scope.currentCluster.id', function() {
    return get(this, 'model.clusterCatalogs').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
  }),

});
