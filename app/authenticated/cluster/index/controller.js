import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  projectController: controller('authenticated.project'),
  modalService:      service('modal'),
  scope:             service(),
  k8s:               service(),

  tags:              alias('projectController.tags'),

  currentClusterNodes: computed('model.nodes.@each.{capacity,allocatable,state}', function() {

    const clusterId = get(this, 'scope.currentCluster.id');

    return get(this, 'model.nodes').filter((n) => n.clusterId === clusterId);

  }),
  actions: {
    dashboard() {
      //    window.open(this.get('k8s.kubernetesDashboard'),'_blank');
    },

    kubectl() {

      /* @TODO-2.0
   if (e.metaKey) {
        let proj = this.get('scope.currentProject.id');
        later(() => {
          window.open(`//${window.location.host}/env/${proj}/infra/console?kubernetes=true&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
        });
      } else {
*/
      this.get('modalService').toggleModal('modal-kubectl', {});
      //     }

    },

    kubeconfig() {

      this.get('modalService').toggleModal('modal-kubeconfig', { escToClose: true, });

    },
  },

});
