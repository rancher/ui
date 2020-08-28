import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get, set, computed } from '@ember/object';
import Controller from '@ember/controller';
import C from 'shared/utils/constants';

const BANNER_NAME = 'dashboard-explorer';

export default Controller.extend({
  modalService:      service('modal'),
  scope:             service(),
  k8s:               service(),
  prefs:             service(),

  cluster:           alias('scope.currentCluster'),

  actions: {
    kubectl() {
      this.get('modalService').toggleModal('modal-kubectl', {});
    },

    kubeconfig() {
      this.get('modalService').toggleModal('modal-kubeconfig', { escToClose: true, });
    },

    closeBanner() {
      const key = `prefs.${ C.PREFS.CLOSED_BANNER }`;
      const closed = get(this, key) || [];

      closed.addObject(BANNER_NAME);
      set(this, key, closed);
    }
  },

  currentClusterNodes: computed('model.nodes.@each.{capacity,allocatable,state,isUnschedulable}', function() {
    const clusterId = get(this, 'scope.currentCluster.id');

    return get(this, 'model.nodes').filter((n) => n.clusterId === clusterId && !n.isUnschedulable);
  }),

  showBanner: computed(`prefs.${ C.PREFS.CLOSED_BANNER }`, function() {
    const closed = get(this, `prefs.${ C.PREFS.CLOSED_BANNER }`) || [];

    return !closed.includes(BANNER_NAME);
  }),
});
