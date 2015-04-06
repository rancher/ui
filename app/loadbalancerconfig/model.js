import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

var LoadBalancerConfig = Cattle.TransitioningResource.extend({
  type: 'loadBalancerConfig',
  listeners: Ember.computed.alias('loadBalancerListeners'),
  config: function() {
    return this;
  }.property()
});

LoadBalancerConfig.reopenClass({
  alwaysInclude: ['loadBalancerListeners','loadBalancers'],
});

export default LoadBalancerConfig;
