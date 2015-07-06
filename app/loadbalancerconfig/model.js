import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var LoadBalancerConfig = Resource.extend({
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
