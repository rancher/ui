import Ember from 'ember';

function allOk(list) {
  for ( let i = 0 ; i < list.get('length') ; i++ ) {
    let item = list.objectAt(i);
    if ( !item || item.get('healthState') !== 'healthy' || item.get('state') !== 'active') {
      return false;
    }
  }

  return true;
}

export default Ember.Controller.extend({
  modalService: Ember.inject.service('modal'),
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  actions: {
    kubernetesReady() {
      this.get('projects').updateOrchestrationState().then(() => {
        this.transitionToRoute('k8s-tab.index');
      });
    },

    kubectl() {
      this.get('modalService').toggleModal('modal-kubectl');
    },

    kubeconfig() {
      this.get('modalService').toggleModal('modal-kubeconfig');
    },
  },

  etcd: Ember.computed('model.kubernetesStack.services.@each.{name,state,healthState}', function() {
    let etcd = this.get('model.kubernetesStack.services').findBy('name','etcd');
    return allOk([etcd]);
  }),

  kubelet: Ember.computed('model.kubernetesStack.services.@each.{name,state,healthState}', function() {
    let kubelet = this.get('model.kubernetesStack.services').findBy('name','kubelet');
    let proxy = this.get('model.kubernetesStack.services').findBy('name','proxy');
    return allOk([kubelet, proxy]);
  }),

  controlPlane: Ember.computed('model.kubernetesStack.services.@each.{name,state,healthState}', function() {
    let other = this.get('model.kubernetesStack.services').filter((x) => !(['etcd','kublet','proxy'].includes(x.get('name'))));
    return allOk(other);
  }),

  systemStacks: Ember.computed('model.kubernetesStack','model.stacks.@each.{name,state,healthState}', function() {
    let kubernetesStack = this.get('model.kubernetesStack');
    let other = this.get('model.stacks').filter((x) => x.get('system') && x !== kubernetesStack);
    return allOk(other);
  }),
});
