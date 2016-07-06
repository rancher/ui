import K8sResource from 'ui/models/k8s-resource';
import PodSelector from 'ui/mixins/k8s-pod-selector';

var Deployment = K8sResource.extend(PodSelector, {
  displayGeneration: function() {
    var want = this.get('metadata.generation');
    var have = this.get('status.observedGeneration');
    if ( have >= want )
    {
      return have+'';
    }
    else
    {
      return have + ' to '+ want;
    }
  }.property('metadata.generation','status.observedGeneration'),

  displayReplicas: function() {
    var want = this.get('spec.replicas')||0;
    var have = this.get('status.replicas')||0;
    var available = Math.max(0, have - (this.get('status.unavailableReplicas')||0));

    if ( want === have )
    {
      if ( available === have )
      {
        return have+'';
      }
      else
      {
        return have + ' (' + available + ' up)';
      }
    }
    else
    {
      return have + ' of ' + want;
    }
  }.property('spec.replicas','status.{replicas,unavailableReplicas}'),
});

export default Deployment;
