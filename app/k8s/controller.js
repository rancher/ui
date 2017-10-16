import Ember from 'ember';

export default Ember.Controller.extend({
  modalService: Ember.inject.service('modal'),
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  projectController: Ember.inject.controller('authenticated.project'),
  tags: Ember.computed.alias('projectController.tags'),

  actions: {
    dashboard() {
      window.open(this.get('k8s.kubernetesDashboard'),'_blank');
    },

    kubectl(e) {
      if (e.metaKey) {
        let proj = this.get('projects.current.id');
        Ember.run.later(() => {
          window.open(`//${window.location.host}/env/${proj}/infra/console?kubernetes=true&isPopup=true`, '_blank', "toolbars=0,width=900,height=700,left=200,top=200");
        });
      } else {
        this.get('modalService').toggleModal('modal-kubectl');
      }
    },

    kubeconfig() {
      this.get('modalService').toggleModal('modal-kubeconfig');
    },
  },
});
