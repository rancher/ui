import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  modalService:      service('modal'),
  scope:             service(),
  k8s:               service(),

  cluster:           alias('scope.currentCluster'),

  actions: {
    kubectl() {
      this.get('modalService').toggleModal('modal-kubectl', {});
    },

    kubeconfig() {
      this.get('modalService').toggleModal('modal-kubeconfig', { escToClose: true, });
    },
  },

  currentClusterNodes: computed('model.nodes.@each.{capacity,allocatable,state,isUnschedulable}', function() {
    const clusterId = get(this, 'scope.currentCluster.id');

    return get(this, 'model.nodes').filter((n) => n.clusterId === clusterId && !n.isUnschedulable);
  }),
});
