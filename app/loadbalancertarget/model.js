import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var LoadBalancerTarget = Cattle.TransitioningResource.extend({
  type: 'loadBalancerTarget',

  instance: function() {
    var id = this.get('instanceId');
    if ( id )
    {
      var proxy = Ember.ObjectProxy.create();
      this.get('store').find('container', id).then(function(instance) {
        proxy.set('content', instance);
      });

      return proxy;
    }
    else
    {
      return null;
    }
  }.property('instanceId')
});

LoadBalancerTarget.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default LoadBalancerTarget;
