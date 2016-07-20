import Ember from 'ember';
import K8sResource from 'ui/models/k8s-resource';
import C from 'ui/utils/constants';

var Namespace = K8sResource.extend({
  k8s: Ember.inject.service(),
  'tab-session': Ember.inject.service(),

  icon: function() {
    if ( this.get('active') )
    {
      return 'icon icon-folder-open';
    }
    else
    {
      return 'icon icon-folder';
    }
  }.property('active'),

  active: function() {
     return ( this.get('id') === this.get(`tab-session.${C.TABSESSION.NAMESPACE}`) );
  }.property(`tab-session.${C.TABSESSION.PROJECT}`, 'id'),

  actions: {
    switchTo: function() {
      // @TODO bad
      window.lc('authenticated').send('switchNamespace', this.get('id'));
    },
  },

  availableActions: function() {
    var choices = this._super();
    choices.unshift({ divider: true });
    choices.unshift({label: 'action.switchNamespace', icon: 'icon icon-folder-open',  action: 'switchTo', enabled: this.get('canSwitchTo')});
    return choices;
  }.property('canSwitchTo'),

  canSwitchTo: function() {
    return this.get('id') !== this.get('k8s.namespace.id');
  }.property('id','k8s.namespace.id'),
});

export default Namespace;
