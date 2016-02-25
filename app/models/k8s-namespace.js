import Ember from 'ember';
import K8sResource from 'ui/models/k8s-resource';

var Namespace = K8sResource.extend({
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
});

export default Namespace;
