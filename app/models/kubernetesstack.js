import Ember from 'ember';
import Stack from 'ui/models/stack';

var KubernetesStack = Stack.extend({
  type: 'kubernetesStack',

  k8s: Ember.inject.service(),

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label   : 'action.edit',       icon : 'icon icon-edit',           action : 'edit',          enabled  : true },
      { divider: true},
      { label   : 'action.remove',     icon : 'icon icon-trash',          action : 'promptDelete',  enabled  : !!a.remove, altAction : 'delete'},
      { divider: true},
      { label   : 'action.viewInApi',  icon : 'icon icon-external-link',  action : 'goToApi',       enabled  : true },
    ];

    return out;
  }.property('actionLinks.remove'),
});

export default KubernetesStack;
