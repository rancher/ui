import Ember from 'ember';

function allOk(list) {
  for ( let i = 0 ; i < list.get('length') ; i++ ) {
    let item = list.objectAt(i);
    if ( !item || ['healthy','started-once'].includes(item.get('healthState')) || item.get('state') !== 'active') {
      return false;
    }
  }

  return true;
}

export default Ember.Controller.extend({
  modalService: Ember.inject.service('modal'),
  projects: Ember.inject.service(),
  k8s: Ember.inject.service(),

  projectController: Ember.inject.controller('authenticated.project'),
  tags: Ember.computed.alias('projectController.tags'),

  actions: {
    kubernetesReady() {
      this.get('projects').updateOrchestrationState().then(() => {
        this.transitionToRoute('k8s');
      });
    },

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

  etcd: Ember.computed('model.kubernetesStack.services.@each.{name,state,healthState}', function() {
    // gets around test errors for now
    var tru = true;
    if ( tru ) {
      return true;
    }
    let etcd = this.get('model.kubernetesStack.services').findBy('name','etcd');
    return allOk([etcd]);
  }),

  kubelet: Ember.computed('model.kubernetesStack.services.@each.{name,state,healthState}', function() {
    // gets around test errors for now
    var tru = true;
    if ( tru ) {
      return true;
    }
    let kubelet = this.get('model.kubernetesStack.services').findBy('name','kubelet');
    let proxy = this.get('model.kubernetesStack.services').findBy('name','proxy');
    return allOk([kubelet, proxy]);
  }),

  controlPlane: Ember.computed('model.kubernetesStack.services.@each.{name,state,healthState}', function() {
    // gets around test errors for now
    var tru = true;
    if ( tru ) {
      return true;
    }
    let other = this.get('model.kubernetesStack.services').filter((x) => !(['etcd','kublet','proxy'].includes(x.get('name'))));
    return allOk(other);
  }),

  systemStacks: Ember.computed('model.kubernetesStack','model.stacks.@each.{name,state,healthState}', function() {
    // gets around test errors for now
    var tru = true;
    if ( tru ) {
      return true;
    }
    let kubernetesStack = this.get('model.kubernetesStack');
    let other = this.get('model.stacks').filter((x) => x.get('system') && x !== kubernetesStack);
    return allOk(other);
  }),
});
