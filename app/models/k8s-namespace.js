import Ember from 'ember';
import K8sResource from 'ui/models/k8s-resource';

var Namespace = K8sResource.extend({
  k8s: Ember.inject.service(),

  isSystem: Ember.computed.equal('id','kube-system'),

  icon: function() {
    if ( this.get('isSystem') )
    {
      return 'icon icon-gear';
    }
    else
    {
      return 'icon icon-folder';
    }
  }.property('isSystem'),

  actions: {
    switchTo: function() {
      // @TODO bad
      window.lc('authenticated').send('switchNamespace', this.get('id'));
    },
  },

  availableActions: function() {
    var choices = this._super();
    choices.unshift({ divider: true });
    choices.unshift({label: 'Switch to this Namespace', icon: 'icon icon-folder-open',  action: 'switchTo', enabled: this.get('canSwitchTo')});
    return choices;
  }.property('canSwitchTo'),

  canSwitchTo: function() {
    return this.get('id') !== this.get('k8s.namespace.id');
  }.property('id','k8s.namespace.id'),
});

export default Namespace;
