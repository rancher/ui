import { inject as service } from '@ember/service';
import Stack from 'ui/models/stack';

var KubernetesStack = Stack.extend({
  type: 'kubernetesStack',

  k8s: service(),

  availableActions: function() {
    let l = this.get('links');

    let out = [
      { label   : 'action.edit',       icon : 'icon icon-edit',           action : 'edit',          enabled  : true },
      { divider: true},
      { label   : 'action.remove',     icon : 'icon icon-trash',          action : 'promptDelete',  enabled  : !!l.remove, altAction : 'delete'},
      { divider: true},
      { label   : 'action.viewInApi',  icon : 'icon icon-external-link',  action : 'goToApi',       enabled  : true },
    ];

    return out;
  }.property('links.remove'),
});

export default KubernetesStack;
