import Ember from 'ember';
import Stack from 'ui/models/stack';
import C from 'ui/utils/constants';

var KubernetesStack = Stack.extend({
  type: 'kubernetesStack',

  k8s: Ember.inject.service(),

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label: 'action.finishUpgrade',  icon: 'icon icon-success',        action: 'finishUpgrade',    enabled: !!a.finishupgrade },
      { label: 'action.rollback',       icon: 'icon icon-history',        action: 'rollback',         enabled: !!a.rollback },
      { label: 'action.cancelUpgrade',  icon: 'icon icon-life-ring',      action: 'cancelUpgrade',    enabled: !!a.cancelupgrade },
      { label: 'action.cancelRollback', icon: 'icon icon-life-ring',      action: 'cancelRollback',   enabled: !!a.cancelrollback },
      { divider: true},
      { label   : 'action.edit',       icon : 'icon icon-edit',           action : 'edit',          enabled  : true },
      { label   : 'action.remove',     icon : 'icon icon-trash',          action : 'promptDelete',  enabled  : !!a.remove, altAction : 'delete'},
      { label   : 'action.viewInApi',  icon : 'icon icon-external-link',  action : 'goToApi',       enabled  : true },
    ];

    return out;
  }.property('actionLinks.{remove,finishupgrade,rollback,cancelupgrade,cancelrollback}'),

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
