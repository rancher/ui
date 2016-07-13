import Ember from 'ember';
import Environment from 'ui/models/environment';
import C from 'ui/utils/constants';

var KubernetesStack = Environment.extend({
  type: 'kubernetesStack',

  k8s: Ember.inject.service(),

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label   : 'action.edit',       icon : 'icon icon-edit',           action : 'edit',          enabled  : true },
      { label   : 'action.remove',     icon : 'icon icon-trash',          action : 'promptDelete',  enabled  : !!a.remove, altAction : 'delete'},
      { label   : 'action.viewInApi',  icon : 'icon icon-external-link',  action : 'goToApi',       enabled  : true },
    ];

    return out;
  }.property('actionLinks.{remove}'),

  deployedResources: function() {
    let uuid = this.get('uuid');
    function fn(obj) {
      return obj.hasLabel(C.LABEL.STACK_UUID, uuid);
    }

    return Ember.Object.create({
      services:    this.get('k8s.services').filter(fn),
      deployments: this.get('k8s.deployments').filter(fn),
      replicasets: this.get('k8s.replicasets').filter(fn),
      rcs:         this.get('k8s.rcs').filter(fn),
      pods:        this.get('k8s.pods').filter(fn),
    });
  }.property(
    'uuid',
    'k8s.services.@each.labels',
    'k8s.deployments.@each.labels',
    'k8s.replicasets.@each.labels',
    'k8s.rcs.@each.labels',
    'k8s.pods.@each.labels'
  ),
});

export default KubernetesStack;
