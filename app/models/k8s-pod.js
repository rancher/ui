import K8sResource from 'ui/models/k8s-resource';

var Pod = K8sResource.extend({
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
});

export default Pod;
