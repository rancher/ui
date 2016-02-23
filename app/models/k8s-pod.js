import Ember from 'ember';
import K8sResource from 'ui/models/k8s-resource';
import { containerStateInator } from 'ui/services/k8s';

var Pod = K8sResource.extend({
  k8s: Ember.inject.service(),

  displayContainerStatus: function() {
    var ready = 0, total = 0;
    (this.get('status.containerStatuses')||[]).forEach((container) => {
      total++;
      if ( container.ready ) {
        ready++;
      }
    });

    if ( total === 0 )
    {
      return 'None';
    }
    else if ( ready === total )
    {
      return total + ' Ready';
    }
    else
    {
      return ready + ' of ' + total + ' Ready';
    }
  }.property('status.containerStatuses.@each.ready'),

  displayContainers: function() {
    var byDockerId = this.get('k8s.containersByDockerId');

    return (this.get('status.containerStatuses')||[]).map((container) => {
      return Ember.Object.create({
        name: container.name,
        displayState: containerStateInator(container.state),
        ready: container.ready,
        restartCount: container.restartCount,
        image: container.image,
        container: byDockerId[ (container.containerID||'').replace("docker://","") ],
      });
    });
  }.property('status.containerStatuses.@each.{state,ready,restartCount,image,name,containerID','k8s.containersByDockerId.[]'),
});

export default Pod;
