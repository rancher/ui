import K8sResource from 'ui/models/k8s-resource';
import PodSelector from 'ui/mixins/k8s-pod-selector';

const esc = Ember.Handlebars.Utils.escapeExpression;
var RC = K8sResource.extend(PodSelector, {
  displayReplicas: function() {
    var want = this.get('spec.replicas');
    var have = this.get('status.replicas');
    if ( want === have )
    {
      return have+'';
    }
    else
    {
      return want + '/' + have;
    }
  }.property('spec.replicas','status.replicas'),
});

export default RC;
