import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var LoadBalancerTarget = Resource.extend({
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
  pollTransitioningInterval: 10000,
});

export default LoadBalancerTarget;
